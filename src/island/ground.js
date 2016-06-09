import THREE from 'three';
import _ from 'lodash';

export function loadGround(layout, palette, ground_texture) {
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
        // 0 -> 4:
        this.textureBank = t & 0xF;
        // 4 -> 6:
        this.useTexture = (t & 0x30) >> 4;
        // 6 -> 8:
        this.useColor = (t & 0xC0) >> 6;
        // 16 -> 17:
        this.orientation = (t & 0x10000) >> 16;
        // 19 -> 32:
        this.textureIndex = (t & 0xFFF80000) >> 19;
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
