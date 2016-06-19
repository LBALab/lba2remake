const push = Array.prototype.push;

export function loadGround(island, section, geometry) {
    for (let x = 0; x < 64; ++x) {
        for (let y = 0; y < 64; ++y) {
            const t0 = loadTriangle(section, x, y, 0);
            const t1 = loadTriangle(section, x, y, 1);

            const r = t0.orientation;
            const s = 1 - r;

            const point = (xi, yi) => (x + xi) * 65 + y + yi;

            if (t0.useColor || t0.useTexture) {
                const p = [point(0, r), point(s, 0), point(1, s)];
                push.apply(geometry.positions, getPositions(section, p));
                push.apply(geometry.uvs, getUVs(section.textureInfo, t0, 1));
                push.apply(geometry.colors, getColors(section.intensity, t0, island.palette, p));
            }
            if (t1.useColor || t1.useTexture) {
                const p = [point(1, s), point(r, 1), point(0, r)];
                push.apply(geometry.positions, getPositions(section, p));
                push.apply(geometry.uvs, getUVs(section.textureInfo, t1, 1));
                push.apply(geometry.colors, getColors(section.intensity, t1, island.palette, p));
            }
        }
    }
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
        const y  = section.heightmap[idx];
        const z = section.z * 64 + (idx % 65);
        positions.push(x / 32, y / 0x4000, z / 32);
    }
    return positions;
}

function getUVs(textureInfo, triangle, field) {
    const index = triangle.textureIndex;
    if (triangle.useTexture) {
        return [
            textureInfo[index * 12 + field], textureInfo[index * 12 + 2 + field],
            textureInfo[index * 12 + 4 + field], textureInfo[index * 12 + 6 + field],
            textureInfo[index * 12 + 8 + field], textureInfo[index * 12 + 10 + field]
        ];
    } else {
        return [0, 0, 0, 0, 0, 0];
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
        const r = palette[idx + i];
        const g = palette[idx + i + 1];
        const b = palette[idx + i + 2];
        return [r, g, b, triangle.useTexture ? 0x80 : 0];
    } else {
        const i = intensity * 12 + 63;
        return [i, i, i, 0xFF];
    }
}
