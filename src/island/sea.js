import {each} from 'lodash';

const push = Array.prototype.push;

const triangles = {
    regular: [
        [[0, 1], [0, 0], [1, 0]],
        [[1, 0], [1, 1], [0, 1]]
    ],
    reversed: [
        [[0, 0], [1, 0], [1, 1]],
        [[1, 1], [0, 1], [0, 0]]
    ],
    '-1,0': [
        [[0, 0], [1, 0], [0, 0.5]],
        [[0, 1], [0, 0.5], [1, 1]],
        [[1, 1], [0, 0.5], [1, 0]]
    ],
    '1,0': [
        [[0, 0], [1, 0], [1, 0.5]],
        [[0, 1], [1, 0.5], [1, 1]],
        [[0, 0], [1, 0.5], [0, 1]]
    ],
    '0,-1': [
        [[0, 1], [0, 0], [0.5, 0]],
        [[0.5, 0], [1, 0], [1, 1]],
        [[0, 1], [0.5, 0], [1, 1]]
    ],
    '0,1': [
        [[0, 0], [0.5, 1], [0, 1]],
        [[1, 0], [1, 1], [0.5, 1]],
        [[0.5, 1], [0, 0], [1, 0]]
    ],
    '-1,0|0,-1': [
        [[0, 0], [0.5, 0], [0, 0.5]],
        [[0.5, 0], [1, 0], [1, 1]],
        [[1, 1], [0, 1], [0, 0.5]],
        [[0, 0.5], [0.5, 0], [1, 1]]
    ],
    '1,0|0,-1': [
        [[0, 0], [0.5, 0], [0, 1]],
        [[0.5, 0], [1, 0], [1, 0.5]],
        [[1, 0.5], [1, 1], [0, 1]],
        [[0, 1], [0.5, 0], [1, 0.5]]
    ],
    '-1,0|0,1': [
        [[0, 0], [1, 0], [0, 0.5]],
        [[0, 0.5], [1, 0], [0.5, 1]],
        [[0, 0.5], [0.5, 1], [0, 1]],
        [[0.5, 1], [1, 0], [1, 1]]
    ],
    '1,0|0,1': [
        [[0, 0], [1, 0], [1, 0.5]],
        [[0, 0], [1, 0.5], [0.5, 1]],
        [[0, 0], [0.5, 1], [0, 1]],
        [[0.5, 1], [1, 0.5], [1, 1]]
    ]
};

export function loadSea(section, geometries, usedTile, offsetX, offsetZ, skyIndex) {
    const n = Math.pow(2, 2 - section.lod) * 8;
    const dn = 32 / n;
    for (let x = 0; x < n; x += 1) {
        const tx = x * dn + offsetX * 32;
        for (let z = 0; z < n; z += 1) {
            const tz = z * dn + offsetZ * 32;
            const surrounded = usedTile && isSurrounded(usedTile, tx, tz);
            if (!usedTile || !surrounded) {
                const point = ([xi, zi]) => (x * dn + xi * dn) * 65 + z * dn + zi * dn;
                const isShore = usedTile && usedTile[tx * 64 + tz] !== undefined && !surrounded;
                const isEdge = ([xi, zi]) =>
                    skyIndex === 14 || (isShore && !isInBetween(usedTile, tx, tz, xi, zi));
                const type = getTriangleType(section, isShore, usedTile, x, z, tx, tz, n);
                each(triangles[type], (tris) => {
                    push.apply(
                        geometries.sea.positions,
                        getSeaPositions(
                            section,
                            [point(tris[0]), point(tris[1]), point(tris[2])],
                            [isEdge(tris[0]), isEdge(tris[1]), isEdge(tris[2])]
                        )
                    );
                });
            }
        }
    }
}

function getTriangleType(section, isShore, usedTile, x, z, tx, tz, n) {
    if (isShore) {
        return usedTile[tx * 64 + tz] ? 'regular' : 'reversed';
    }
    const sides = [];
    if (x === 0 && section.reduceEdges.indexOf('-1,0') !== -1) {
        sides.push('-1,0');
    }
    if (x === n - 1 && section.reduceEdges.indexOf('1,0') !== -1) {
        sides.push('1,0');
    }
    if (z === 0 && section.reduceEdges.indexOf('0,-1') !== -1) {
        sides.push('0,-1');
    }
    if (z === n - 1 && section.reduceEdges.indexOf('0,1') !== -1) {
        sides.push('0,1');
    }
    if (sides.length > 0) {
        return sides.join('|');
    }
    return 'regular';
}

function isSurrounded(usedTile, x, z) {
    return _.every([
        isUsed(usedTile, x - 1, z - 1),
        isUsed(usedTile, x - 1, z),
        isUsed(usedTile, x - 1, z + 1),
        isUsed(usedTile, x, z - 1),
        isUsed(usedTile, x, z),
        isUsed(usedTile, x, z + 1),
        isUsed(usedTile, x + 1, z - 1),
        isUsed(usedTile, x + 1, z),
        isUsed(usedTile, x + 1, z + 1)
    ]);
}

function isUsed(usedTile, x, z) {
    return x < 0 || z < 0 || x >= 64 || z >= 64 || usedTile[x * 64 + z] !== undefined;
}

function isInBetween(usedTile, x, z, xi, zi) {
    const tx = xi * 2 - 1;
    const tz = zi * 2 - 1;
    return !isUsed(usedTile, x + tx, z + tz)
        || !isUsed(usedTile, x + tx, z)
        || !isUsed(usedTile, x, z + tz);
}

function getSeaPositions(section, points, isEdge) {
    const positions = [];
    for (let i = 0; i < 3; i += 1) {
        const idx = points[i];
        const x = section.x * 32 + (65 - Math.floor(idx / 65)) - 32;
        const z = section.z * 32 + (idx % 65);
        positions.push(x / 32, isEdge[i] ? 0 : 1, z / 32);
    }
    return positions;
}
