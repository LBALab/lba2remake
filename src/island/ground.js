import THREE from 'three';
import _ from 'lodash';
import {loadTexture} from '../texture';
import vertexShader from './shaders/ground.vert.glsl';
import fragmentShader from './shaders/ground.frag.glsl';

const push = Array.prototype.push;

export function loadGround(island) {
    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        vertexColors: THREE.FaceColors,
        uniforms: {
            tiles: {value: loadTexture(island.files.ile.getEntry(1), island.palette)}
        }
    });
    const bufferGeometry = new THREE.BufferGeometry();
    const {positions, uvs, colors} = loadSections(island);
    bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    return new THREE.Mesh(bufferGeometry, material);
}

function loadSections(island) {
    const geometry = {
        positions: [],
        uvs: [],
        colors: []
    };
    _.each(island.layout, section => {
        for (let x = 0; x < 64; ++x) {
            for (let y = 0; y < 64; ++y) {
                const quad = loadQuad(section, island.palette, x, y);
                push.apply(geometry.positions, quad.positions);
                push.apply(geometry.uvs, quad.uvs);
                push.apply(geometry.colors, quad.colors);
            }
        }
    });
    return geometry;
}

function loadQuad(section, palette, x, y) {
    const quad = {
        positions: [],
        uvs: [],
        colors: []
    };

    const t0 = loadTriangle(section, x, y, 0);
    const t1 = loadTriangle(section, x, y, 1);

    const r = t0.orientation;
    const s = 1 - r;

    const point = (xi, yi) => (x + xi) * 65 + y + yi;

    if (t0.useColor || t0.useTexture) {
        const p = [point(0, r), point(s, 0), point(1, s)];
        push.apply(quad.positions, getPositions(section, p));
        push.apply(quad.uvs, getUVs(section.textureInfo, t0, 1));
        push.apply(quad.colors, getColors(section.intensity, t0, palette, p));
    }
    if (t1.useColor || t1.useTexture) {
        const p = [point(1, s), point(r, 1), point(0, r)];
        push.apply(quad.positions, getPositions(section, p));
        push.apply(quad.uvs, getUVs(section.textureInfo, t1, 1));
        push.apply(quad.colors, getColors(section.intensity, t1, palette, p));
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

function getPositions(section, points) {
    const positions = [];
    for (let i = 0; i < 3; ++i) {
        const idx = points[i];
        const x = section.x * 64 + (65 - Math.floor(idx / 65));
        const y = section.y * 64 + (idx % 65);
        const h  = section.heightmap[idx];
        positions.push(x / 32, h / 0x4000, y / 32);
    }
    return positions;
}

function getUVs(textureInfo, triangle, field) {
    const div = uv => uv / 255;
    const index = triangle.textureIndex;
    if (triangle.useTexture) {
        const dir = triangle.useColor ? -1 : 1;
        return [
            div(textureInfo[index * 12 + field]) * dir, div(textureInfo[index * 12 + 2 + field]) * dir,
            div(textureInfo[index * 12 + 4 + field]) * dir, div(textureInfo[index * 12 + 6 + field]) * dir,
            div(textureInfo[index * 12 + 8 + field]) * dir, div(textureInfo[index * 12 + 10 + field]) * dir
        ];
    } else {
        return [
            -2000, -2000,
            -2000, -2000,
            -2000, -2000
        ];
    }
}

function getColors(intensity, triangle, palette, points) {
    const colors = [];
    for (let i = 0; i < 3; ++i) {
        push.apply(colors, getColor(triangle, palette, intensity[points[i]] & 0xF));
    }
    return colors;
}

function getColor(triangle, palette, intensity) {
    if (triangle.useColor) {
        const idx = (triangle.textureBank << 4) * 3;
        const i = intensity * 3;
        const r = palette[idx + i] / 255;
        const g = palette[idx + i + 1] / 255;
        const b = palette[idx + i + 2] / 255;
        return [r, g, b];
    } else {
        const i = (intensity / 15) * 0.8 + 0.2;
        return [i, i, i];
    }
}
