import {map} from 'lodash';
import {bits} from '../../../utils';
import {WORLD_SCALE, WORLD_SCALE_B} from '../../../utils/lba';
import { IslandSection } from './IslandLayout';
import { TRIANGLE_POINTS } from './data/heightmap';

export const LIQUID_TYPES = {
    WATER: 12,
    LAVA: 9,
};

const push = Array.prototype.push;

export function loadGround(section: IslandSection, geometries, tileUsageInfo) {
    const { groundMesh } = section;
    for (let x = 0; x < 64; x += 1) {
        for (let z = 0; z < 64; z += 1) {
            const t0 = loadTriangle(groundMesh, x, z, 0);
            const t1 = loadTriangle(groundMesh, x, z, 1);

            const isSeaLevelLiquid = (t, p) => {
                const seaLevel = groundMesh.heightmap[p[0]] === 0
                    && groundMesh.heightmap[p[1]] === 0
                    && groundMesh.heightmap[p[2]] === 0;
                return seaLevel && t.liquid !== 0;
            };

            const triangle = (t) => {
                const pts = map(t.points, pt => ((x + pt.x) * 65) + z + pt.z);
                if (!isSeaLevelLiquid(t, pts) && (t.useColor || t.useTexture || t.unk0)) {
                    tileUsageInfo[(x * 64) + z] = t0.orientation;
                    if (t.useTexture || (!t.useTexture && !t.useColor)) {
                        push.apply(
                            geometries.ground_textured.positions,
                            getPositions(section, pts)
                        );
                        push.apply(
                            geometries.ground_textured.uvs,
                            getUVs(section.textureInfo, t.uvIndex)
                        );
                        push.apply(
                            geometries.ground_textured.colors,
                            getColors(t)
                        );
                        push.apply(
                            geometries.ground_textured.intensities,
                            getIntensities(groundMesh.intensity, pts)
                        );
                    } else {
                        push.apply(
                            geometries.ground_colored.positions,
                            getPositions(section, pts)
                        );
                        push.apply(
                            geometries.ground_colored.colors,
                            getColors(t)
                        );
                        push.apply(
                            geometries.ground_colored.intensities,
                            getIntensities(groundMesh.intensity, pts)
                        );
                    }
                }
            };

            triangle(t0);
            triangle(t1);
        }
    }
}

function loadTriangle(groundMesh, x, z, idx) {
    const flags = groundMesh.triangles[(((x * 64) + z) * 2) + idx];
    const orientation = bits(groundMesh.triangles[((x * 64) + z) * 2], 16, 1);
    return {
        index: idx,
        color: bits(flags, 0, 4),
        unk0: bits(flags, 4, 1),
        useTexture: bits(flags, 5, 1),
        unk1: bits(flags, 6, 1),
        useColor: bits(flags, 7, 1),
        sound: bits(flags, 8, 4),
        liquid: bits(flags, 12, 4),
        orientation,
        collision: bits(flags, 17, 1),
        unk2: bits(flags, 18, 1),
        uvIndex: bits(flags, 19, 13),
        points: TRIANGLE_POINTS[orientation][idx]
    };
}

function getPositions(section, points) {
    const positions = [];
    for (let i = 0; i < 3; i += 1) {
        const idx = points[i];
        const x = (section.x * 64) + (65 - Math.floor(idx / 65));
        const y = section.groundMesh.heightmap[idx];
        const z = (section.z * 64) + (idx % 65);
        positions.push(
            x * WORLD_SCALE_B,
            y * WORLD_SCALE,
            z * WORLD_SCALE_B
        );
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
        for (let i = 0; i < 3; i += 1) {
            colors.push(triangle.color);
        }
        return colors;
    }
    return [0, 0, 0];
}

function getIntensities(intensity, points) {
    const intensities = [];
    for (let i = 0; i < 3; i += 1) {
        intensities.push(intensity[points[i]]);
    }
    return intensities;
}
