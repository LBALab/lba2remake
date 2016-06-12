import THREE from 'three';
import _ from 'lodash';
import {loadTexture} from '../texture';

const push = Array.prototype.push;

export function loadGround(island) {
    const geometry = new THREE.Geometry();
    const material = new THREE.MeshBasicMaterial({
        wireframe: false,
        vertexColors: THREE.FaceColors,
        map: loadTexture(island.files.ile.getEntry(1), island.palette)
    });

    loadSections(island, geometry);

    geometry.colorsNeedUpdate = true;
    geometry.uvsNeedUpdate = true;
    geometry.computeBoundingSphere();

    return new THREE.Mesh(geometry, material);
}

function loadSections(island, geometry) {
    _.each(island.layout, section => {
        const vertices = _.map(section.heightmap, heightToVector.bind(null, section));
        push.apply(geometry.vertices, vertices);

        for (let x = 0; x < 64; ++x) {
            for (let y = 0; y < 64; ++y) {
                const quad = loadQuad(section, island.palette, x, y);
                push.apply(geometry.faces, quad.faces);
                push.apply(geometry.faceVertexUvs[0], quad.uvs);
            }
        }
    });
}

function heightToVector(section, height, index) {
    const x = section.x * 64 + (65 - Math.floor(index / 65));
    const y = section.y * 64 + (index % 65);
    return new THREE.Vector3(x / 32, height / 0x4000, y / 32);
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

    const point = (xi, yi) => (x + xi) * 65 + y + yi;
    const o = section.index * 65 * 65;

    if (t0.useColor || t0.useTexture) {
        const p = [point(0, r), point(s, 0), point(1, s)];
        quad.faces.push(new THREE.Face3(o + p[0], o + p[1], o + p[2], null, getColors(section, t0, palette, p)));
        quad.uvs.push(getUVs(section.textureInfo, t0, 1));
    }
    if (t1.useColor || t1.useTexture) {
        const p = [point(1, s), point(r, 1), point(0, r)];
        quad.faces.push(new THREE.Face3(o + p[0], o + p[1], o + p[2], null, getColors(section, t1, palette, p)));
        quad.uvs.push(getUVs(section.textureInfo, t1, 1));
    }

    return quad;
}

function loadTriangle(section, x, y, idx) {
    const t = section.triangles[(x * 64 + y) * 2 + idx];
    const bits = (bitfield, offset, length) => (bitfield & (((1 << length) - 1)) << offset) >> offset;
    return {
        textureBank: bits(t, 0, 4),
        useTexture: bits(t, 4, 2),
        useColor: bits(t, 6, 2),
        orientation: bits(t, 16, 1),
        textureIndex: bits(t, 19, 13)
    };
}

function getUVs(textureInfo, triangle, field) {
    const div = uv => uv / 255;
    const index = triangle.textureIndex;
    if (triangle.useTexture) {
        return [
            new THREE.Vector2(div(textureInfo[index * 12 + field]), div(textureInfo[index * 12 + 2 + field])),
            new THREE.Vector2(div(textureInfo[index * 12 + 4 + field]), div(textureInfo[index * 12 + 6 + field])),
            new THREE.Vector2(div(textureInfo[index * 12 + 8 + field]), div(textureInfo[index * 12 + 10 + field]))
        ];
    } else {
        return [
            new THREE.Vector2(1, 1),
            new THREE.Vector2(1, 1),
            new THREE.Vector2(1, 1)
        ];
    }
}

function getColors(section, triangle, palette, points) {
    const intensity = section.intensity;
    return [
        getColor(triangle, palette, intensity[points[0]] & 0xF),
        getColor(triangle, palette, intensity[points[1]] & 0xF),
        getColor(triangle, palette, intensity[points[2]] & 0xF)
    ];
}

function getColor(triangle, palette, intensity) {
    if (triangle.useColor) {
        const idx = (triangle.textureBank << 4) * 3;
        const i = intensity * 3;
        const r = palette[idx + i] / 255;
        const g = palette[idx + i + 1] / 255;
        const b = palette[idx + i + 2] / 255;
        return new THREE.Color(r, g, b);
    } else {
        const i = (intensity / 15) * 0.8 + 0.2;
        return new THREE.Color(i, i, i);
    }
}
