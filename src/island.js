import THREE from 'three';
import async from 'async';
import _ from 'lodash';
import HQR from './hqr';

export default function(name, callback) {
    async.auto({
        ress: load_hqr.bind(null, 'data/RESS.HQR'),
        ile: load_hqr.bind(null, `data/${name}.ILE`),
    }, function(err, data) {
        const palette = new Uint8Array(data.ress.getEntry(0));
        const layout = load_layout(data.ile);
        console.log(layout);
        callback(load_ground(layout, palette));
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
                id: layout_raw[i],
                x: (16 - x) - 8,
                y: y - 8,
                heightmap: new Uint16Array(ile.getEntry(id * 6 + 1)),
                triangles: new DataView(ile.getEntry(id * 6 - 1))
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

function load_ground(layout, palette) {
    const material = new THREE.MultiMaterial([
        new THREE.MeshBasicMaterial({wireframe: false, color: 0xFF0000}),
        new THREE.MeshBasicMaterial({wireframe: false, color: 0x0000FF})
    ]);
    const geometry = new THREE.Geometry();
    const {vertices, faces} = geometry;
    geometry.colorsNeedUpdate = true;

    _.each(layout, (section, s_idx) => {
        _.each(section.heightmap, (height, idx) => {
            const x = section.x * 64 + (65 - Math.floor(idx / 65));
            const y = section.y * 64 + (idx % 65);
            vertices.push(new THREE.Vector3(x, height / 256.0 / 1.5, y));
        });

        const s_offset = s_idx * 65 * 65;
        for (let x = 0; x < 64; ++x) {
            for (let y = 0; y < 64; ++y) {
                const t0 = get_triangle(section.triangles, (x * 64 + y) * 2);
                const t1 = get_triangle(section.triangles, (x * 64 + y) * 2 + 1);

                const x0 = x * 65;
                const x1 = (x + 1) * 65;
                const y0 = y;
                const y1 = y + 1;

                if (t0.orientation) {
                    const m0 = t0.useTexture ? 1 : 0;
                    faces.push(new THREE.Face3(
                        s_offset + x0 + y0,
                        s_offset + x1 + y0,
                        s_offset + x0 + y1,
                        null, null, m0
                    ));
                    faces.push(new THREE.Face3(
                        s_offset + x1 + y1,
                        s_offset + x0 + y1,
                        s_offset + x1 + y0,
                        null, null, m0
                    ));
                } else {
                    const m1 = t1.useTexture ? 1 : 0;
                    faces.push(new THREE.Face3(
                        s_offset + x0 + y1,
                        s_offset + x0 + y0,
                        s_offset + x1 + y1,
                        null, null, m1
                    ));
                    faces.push(new THREE.Face3(
                        s_offset + x1 + y0,
                        s_offset + x1 + y1,
                        s_offset + x0 + y0,
                        null, null, m1
                    ));
                }
            }
        }
    });

    geometry.computeBoundingSphere();
    return new THREE.Mesh(geometry, material);
}

function get_triangle(data_view, offset) {
    const t = data_view.getUint32(offset * 4, true);
    return {
        textureBank: t & 0xF, // bits: 0 => 4
        useTexture: (t & 0x30) >> 4, // bits: 4 => 6
        useColor: (t & 0xC0) >> 6, // bits: 6 => 8
        orientation: (t & 0x10000) >> 16, // bits: 16 => 17
        textureIndex: (t & 0xFFF80000) >> 19 // bits: 19 => 32
    };
}