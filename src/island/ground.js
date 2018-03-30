import {map} from 'lodash';
import * as THREE from 'three';
import {bits} from '../utils';

const push = Array.prototype.push;

export function loadGround(section, geometries, usedTiles) {
    for (let x = 0; x < 64; x += 1) {
        for (let z = 0; z < 64; z += 1) {
            const t0 = loadTriangle(section, x, z, 0);
            const t1 = loadTriangle(section, x, z, 1);

            const isSeaLevelLiquid = (t, p) => {
                const seaLevel = section.heightmap[p[0]] === 0
                    && section.heightmap[p[1]] === 0
                    && section.heightmap[p[2]] === 0;
                return seaLevel && t.liquid !== 0;
            };

            const triangle = (t) => {
                const pts = map(t.points, pt => (x + pt.x) * 65 + z + pt.z);
                if (!isSeaLevelLiquid(t, pts) && (t.useColor || t.useTexture)) {
                    usedTiles[x * 64 + z] = t0.orientation;
                    if (t.useTexture) {
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
                            getIntensities(section.intensity, pts)
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
                            getIntensities(section.intensity, pts)
                        );
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
    const t0 = loadTriangleForPhysics(section, xFloor, zFloor, x, z, 0);
    return (t0.height != null) ? t0 : loadTriangleForPhysics(section, xFloor, zFloor, x, z, 1);
}

const TRIANGLE_POINTS = [
    [
        makeTrianglePoints(0, 0),
        makeTrianglePoints(0, 1)
    ],
    [
        makeTrianglePoints(1, 0),
        makeTrianglePoints(1, 1)
    ]
];

function loadTriangle(section, x, z, idx) {
    const flags = section.triangles[(x * 64 + z) * 2 + idx];
    const orientation = bits(section.triangles[(x * 64 + z) * 2], 16, 1);
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

const DOWN = new THREE.Vector3(0, -1, 0);
const RAY = new THREE.Ray(new THREE.Vector3(), DOWN);
const TGT = new THREE.Vector3();
const PTS = [
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3()
];

function loadTriangleForPhysics(section, x, z, xTgt, zTgt, idx) {
    const flags = section.triangles[(x * 64 + z) * 2 + idx];
    const baseFlags = idx ? section.triangles[(x * 64 + z) * 2] : flags;
    const orientation = bits(baseFlags, 16, 1);
    const src_pts = TRIANGLE_POINTS[orientation][idx];

    for (let i = 0; i < 3; i += 1) {
        const pt = src_pts[i];
        const ptIdx = (x + pt.x) * 65 + z + pt.z;
        PTS[i].set(
            x + pt.x,
            section.heightmap[ptIdx] / 0x4000,
            z + pt.z
        );
    }

    RAY.origin.set(xTgt, 5, zTgt);
    const tgt = RAY.intersectTriangle(PTS[0], PTS[2], PTS[1], true, TGT);

    return {
        sound: bits(flags, 8, 4),
        collision: bits(flags, 17, 1),
        height: tgt && tgt.y
    };
}

function makeTrianglePoints(orientation, idx) {
    const rOrientation = 1 - orientation;
    return [{
        x: idx,
        z: idx ? rOrientation : orientation
    }, {
        x: idx ? orientation : rOrientation,
        z: idx
    }, {
        x: 1 - idx,
        z: idx ? orientation : rOrientation,
    }];
}

function getPositions(section, points) {
    const positions = [];
    for (let i = 0; i < 3; i += 1) {
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
