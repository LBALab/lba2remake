import THREE from 'three';
import _ from 'lodash';

export function loadGround(layout, palette, ground_texture) {
    const material = new THREE.MeshBasicMaterial({
        wireframe: false,
        vertexColors: THREE.FaceColors,
        map: ground_texture
    });
    const geometry = new THREE.Geometry();

    _.each(layout, (section) => {
        _.each(section.heightmap, (height, idx) => {
            const x = section.x * 64 + (65 - Math.floor(idx / 65));
            const y = section.y * 64 + (idx % 65);
            geometry.vertices.push(new THREE.Vector3(x, height / 256.0 / 1.5, y));
        });

        for (let x = 0; x < 64; ++x) {
            for (let y = 0; y < 64; ++y) {
                const quad = loadQuad(section, palette, x, y);
                geometry.faces.push.apply(geometry.faces, quad.faces);
                geometry.faceVertexUvs[0].push.apply(geometry.faceVertexUvs[0], quad.uvs);
            }
        }
    });

    geometry.colorsNeedUpdate = true;
    geometry.uvsNeedUpdate = true;
    geometry.computeBoundingSphere();
    return new THREE.Mesh(geometry, material);
}

function loadQuad(section, palette, x, y) {
    const quad = {
        faces: [],
        uvs: []
    };
    const t0 = loadTriangle(section, x, y, 0);
    const t1 = loadTriangle(section, x, y, 1);
    const r = t0.orientation;
    const s = 1 - r;
    const point = (xi, yi) => section.index * 65 * 65 + (x + xi) * 65 + y + yi;
    //textureInfo[tri[t].textureIndex].uv[uvOrder[i]].u
    if (t0.useColor || t0.useTexture) {
        quad.faces.push(new THREE.Face3(point(0, s), point(r, 0), point(s, 1), null, getColor(t0, palette)));
        quad.uvs.push([new THREE.Vector2(0, s), new THREE.Vector2(r, 0), new THREE.Vector2(s, 1)]);
    }
    if (t1.useColor || t1.useTexture) {
        quad.faces.push(new THREE.Face3(point(1, r), point(s, 1), point(r, 0), null, getColor(t1, palette)));
        quad.uvs.push([new THREE.Vector2(1, r), new THREE.Vector2(s, 1), new THREE.Vector2(r, 0)]);
    }
    return quad;
}

function loadTriangle(section, x, y, idx) {
    const t = section.triangles[(x * 64 + y) * 2 + idx];
    return {
        textureBank: t & 0xF, // 0 -> 4
        useTexture: (t & 0x30) >> 4, // 4 -> 6
        useColor: (t & 0xC0) >> 6, // 6 -> 8
        orientation: (t & 0x10000) >> 16, // 16 -> 17
        textureIndex: (t & 0xFFF80000) >> 19 // 19 -> 32
    };
}

function getColor(triangle, palette) {
    if (triangle.useColor) {
        const idx = triangle.textureBank * 16;
        const r = palette[idx];
        const g = palette[idx + 1];
        const b = palette[idx + 2];
        return new THREE.Color(r << 24 + g << 16 + b << 8);
    }
}
