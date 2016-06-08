import THREE from 'three';
import async from 'async';
import _ from 'lodash';
import HQR from './hqr';

export default function(name, callback) {
    async.auto({
        ress: load_hqr.bind(null, 'data/RESS.HQR'),
        ile: load_hqr.bind(null, `data/${name}.ILE`)
    }, function(err, data) {
        const palette = new Uint8Array(data.ress.getEntry(0));
        const layout = load_layout(data.ile);
        const ground_texture = load_sub_texture(data.ile.getEntry(1), palette, 0, 0, 32, 32);
        console.log(layout);
        callback(load_ground(layout, palette, ground_texture));
    });
}

function load_hqr(file, callback) {
    new HQR().load(file, function() {
        callback.call(null, null, this);
    });
}

function load_layout(ile) {
    const layout_raw = new Uint8Array(ile.getEntry(0));
    const layout = [];
    for (let i = 0; i < 256; ++i) {
        const x = Math.floor(i / 16);
        const y = i % 16;
        if (layout_raw[i]) {
            const id = layout_raw[i];
            layout.push({
                id: id,
                x: (16 - x) - 8,
                y: y - 8,
                triangles: new Uint32Array(ile.getEntry(id * 6 - 1)),
                textureInfo: new Uint16Array(ile.getEntry(id * 6)),
                heightmap: new Uint16Array(ile.getEntry(id * 6 + 1)),
                intensity: new Uint8Array(ile.getEntry(id * 6 + 2))
            })
        }
    }
    return layout;
}

function load_texture(buffer, palette) {
    const pixel_data = new Uint8Array(buffer);
    const image_data = new Uint8Array(256 * 256 * 4);
    for (let i = 0; i < 65536; ++i) { // 256 * 256
        image_data[i * 4] = palette[pixel_data[i] * 3];
        image_data[i * 4 + 1] = palette[pixel_data[i] * 3 + 1];
        image_data[i * 4 + 2] = palette[pixel_data[i] * 3 + 2];
        image_data[i * 4 + 3] = 0xFF;
    }
    const texture = new THREE.DataTexture(image_data, 256, 256);
    texture.needsUpdate = true;
    return texture;
}

function load_sub_texture(buffer, palette, x_offset, y_offset, width, height) {
    const pixel_data = new Uint8Array(buffer);
    const image_data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            const src_i = (y + y_offset) * 256 + x + x_offset;
            const tgt_i = y * width + x;
            image_data[tgt_i * 4] = palette[pixel_data[src_i] * 3];
            image_data[tgt_i * 4 + 1] = palette[pixel_data[src_i] * 3 + 1];
            image_data[tgt_i * 4 + 2] = palette[pixel_data[src_i] * 3 + 2];
            image_data[tgt_i * 4 + 3] = 0xFF;
        }
    }
    const texture = new THREE.DataTexture(
        image_data,
        width,
        height,
        THREE.RGBAFormat,
        THREE.UnsignedByteType,
        THREE.UVMapping,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping,
        THREE.LinearFilter,
        THREE.LinearMipMapLinearFilter
    );
    texture.needsUpdate = true;
    texture.generateMipmaps = true;
    return texture;
}

function load_ground(layout, palette, ground_texture) {
    const material = new THREE.MeshBasicMaterial({
        wireframe: false,
        vertexColors: THREE.FaceColors,
        map: ground_texture
    });
    const geometry = new THREE.Geometry();
    const {vertices, faces, faceVertexUvs} = geometry;
    geometry.colorsNeedUpdate = true;
    geometry.uvsNeedUpdate = true;

    _.each(layout, (section, s_idx) => {
        _.each(section.heightmap, (height, idx) => {
            const x = section.x * 64 + (65 - Math.floor(idx / 65));
            const y = section.y * 64 + (idx % 65);
            vertices.push(new THREE.Vector3(x, height / 256.0 / 1.5, y));
        });

        const s_offset = s_idx * 65 * 65;
        for (let x = 0; x < 64; ++x) {
            for (let y = 0; y < 64; ++y) {
                const triangle = (idx) => new Triangle(section.triangles[(x * 64 + y) * 2 + idx]);
                const t0 = triangle(0);
                const t1 = triangle(1);
                const r = t0.orientation;
                const s = 1 - r;
                const pt = (sx, sy) => s_offset + (x + sx) * 65 + y + sy;
                //textureInfo[tri[t].textureIndex].uv[uvOrder[i]].u
                if (t0.useColor || t0.useTexture) {
                    faces.push(new THREE.Face3(pt(0, s), pt(r, 0), pt(s, 1), null, t0.color(palette)));
                    faceVertexUvs[0].push([new THREE.Vector2(0, s), new THREE.Vector2(r, 0), new THREE.Vector2(s, 1)]);
                }
                if (t1.useColor || t1.useTexture) {
                    faces.push(new THREE.Face3(pt(1, r), pt(s, 1), pt(r, 0), null, t1.color(palette)));
                    faceVertexUvs[0].push([new THREE.Vector2(1, r), new THREE.Vector2(s, 1), new THREE.Vector2(r, 0)]);
                }
            }
        }
    });

    geometry.computeBoundingSphere();
    return new THREE.Mesh(geometry, material);
}

class Triangle {
    constructor(t) {
        this.textureBank = t & 0xF; // bits: 0 => 4
        this.useTexture = (t & 0x30) >> 4; // bits: 4 => 6
        this.useColor = (t & 0xC0) >> 6; // bits: 6 => 8
        this.orientation = (t & 0x10000) >> 16; // bits: 16 => 17
        this.textureIndex = (t & 0xFFF80000) >> 19; // bits: 19 => 32
    }

    color(palette) {
        if (this.useColor) {
            const idx = this.textureBank * 16;
            const r = palette[idx];
            const g = palette[idx + 1];
            const b = palette[idx + 2];
            return new THREE.Color(r << 24 + g << 16 + b << 8);
        }
    }
}
