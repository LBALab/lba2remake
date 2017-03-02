import {bits} from '../utils';
import {map} from 'lodash';
const push = Array.prototype.push;

export function loadGround(section, geometries, usedTiles) {
    for (let x = 0; x < 64; ++x) {
        for (let z = 0; z < 64; ++z) {
            const t0 = loadTriangle(section, x, z, 0);
            const t1 = loadTriangle(section, x, z, 1);

            const isSeaLevelLiquid = (t, p) => {
                const seaLevel = section.heightmap[p[0]] == 0 && section.heightmap[p[1]] == 0 && section.heightmap[p[2]] == 0;
                return seaLevel && t.liquid != 0;
            };

            const triangle = t => {
                const pts = map(t.points, pt => (x + pt.x) * 65 + z + pt.z);
                if (!isSeaLevelLiquid(t, pts) && (t.useColor || t.useTexture)) {
                    usedTiles[x * 64 + z] = t0.orientation;
                    if (t.useTexture) {
                        push.apply(geometries.ground_textured.positions, getPositions(section, pts));
                        push.apply(geometries.ground_textured.uvs, getUVs(section.textureInfo, t.uvIndex));
                        push.apply(geometries.ground_textured.colors, getColors(t));
                        push.apply(geometries.ground_textured.intensities, getIntensities(section.intensity, pts));
                    } else {
                        push.apply(geometries.ground_colored.positions, getPositions(section, pts));
                        push.apply(geometries.ground_colored.colors, getColors(t));
                        push.apply(geometries.ground_colored.intensities, getIntensities(section.intensity, pts));
                    }
                }
            };

            triangle(t0);
            triangle(t1);
        }
    }
}

export function getTriangleFromPos(section, x, z) {
    const xFloor = Math.floor(x);
    const zFloor = Math.floor(z);
    const xMod = x - xFloor;
    const zMod = z - zFloor;
    const t0 = loadTriangle(section, xFloor, zFloor, 0);
    const t1 = loadTriangle(section, xFloor, zFloor, 1);
    if (t0.orientation) {
        return zMod > (1 - xMod) ? t1 : t0;
    } else {
        return zMod > xMod ? t1 : t0;
    }
}

function loadTriangle(section, x, z, idx) {
    const flags = section.triangles[(x * 64 + z) * 2 + idx];
    const orientation = bits(section.triangles[(x * 64 + z) * 2], 16, 1);
    const rOrientation = 1 - orientation;
    const t = {
        index: idx,
        color: bits(flags, 0, 4),
        unk0: bits(flags, 4, 1),
        useTexture: bits(flags, 5, 1),
        unk1: bits(flags, 6, 1),
        useColor: bits(flags, 7, 1),
        sound: bits(flags, 8, 4),
        liquid: bits(flags, 12, 4),
        orientation: orientation,
        collision: bits(flags, 17, 1),
        unk2: bits(flags, 18, 1),
        uvIndex: bits(flags, 19, 13)
    };
    t.points = [{
        x: idx,
        z: idx ? rOrientation : orientation
    }, {
        x: idx ? orientation : rOrientation,
        z: idx
    }, {
        x: 1 - idx,
        z: idx ? orientation : rOrientation,
    }];
    t.getHeight = (dx, dz) => {
        const ptHeight = pt => section.heightmap[(x + pt.x) * 65 + z + pt.z] / 0x4000;
        const mix = (a, b, m) => a * (1 - m) + b * m;
        const mlt = v => Math.round(v * 0x4000);
        const tf = v => v.toFixed(2);
        if (orientation) {
            const hz = mix(ptHeight(t.points[0]), ptHeight(t.points[1]), idx ? dz : 1 - dz);
            const h = mix(hz, ptHeight(t.points[2]), idx ? 1 - dx : dx);
            return {
                h: h,
                expr: `\nhz = mix(${mlt(ptHeight(t.points[0]))}, ${mlt(ptHeight(t.points[1]))}, ${tf(idx ? dz : 1 - dz)}) => ${mlt(hz)}`
                    + `\nh = mix(${mlt(hz)}, ${mlt(ptHeight(t.points[2]))}, ${tf(idx ? 1 - dx : dx)}) => ${mlt(h)}`
            };
        } else {
            const hx = mix(ptHeight(t.points[0]), ptHeight(t.points[1]), idx ? 1 - dx : dx);
            const h = mix(hx, ptHeight(t.points[2]), idx ? 1 - dz : dz);
            return {
                h: h,
                expr: `\nhx = mix(${mlt(ptHeight(t.points[0]))}, ${mlt(ptHeight(t.points[1]))}, ${tf(idx ? 1 - dx : dx)}) => ${mlt(hx)}`
                    + `\nh = mix(${mlt(hx)}, ${mlt(ptHeight(t.points[2]))}, ${tf(idx ? 1 - dz : dz)}) => ${mlt(h)}`
            };
        }
    };
    return t;
}

function getPositions(section, points) {
    const positions = [];
    for (let i = 0; i < 3; ++i) {
        const idx = points[i];
        const x = section.x * 64 + (65 - Math.floor(idx / 65));
        const y = section.heightmap[idx];
        const z = section.z * 64 + (idx % 65);
        positions.push(x / 32, y / 0x4000, z / 32);
    }
    return positions;
}

function getUVs(textureInfo, index) {
    const offset = index * 12;
    return [
        textureInfo[offset + 1], textureInfo[offset + 3],
        textureInfo[offset + 5], textureInfo[offset + 7],
        textureInfo[offset + 9], textureInfo[offset + 11]
    ];
}

function getColors(triangle) {
    if (triangle.useColor) {
        const colors = [];
        for (let i = 0; i < 3; ++i) {
            colors.push(triangle.color);
        }
        return colors;
    } else {
        return [0, 0, 0];
    }
}

function getIntensities(intensity, points) {
    const intensities = [];
    for (let i = 0; i < 3; ++i) {
        intensities.push(intensity[points[i]]);
    }
    return intensities;
}