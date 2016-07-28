const push = Array.prototype.push;

export function loadSea(section, geometries, usedTile, offsetX, offsetZ) {
    const n = Math.pow(2, 2 - section.lod) * 8;
    const dn = 32 / n;
    for (let x = 0; x < n; ++x) {
        const tx = x * dn + offsetX * 32;
        for (let z = 0; z < n; ++z) {
            const tz = z * dn + offsetZ * 32;
            const surrounded = usedTile && isSurrounded(usedTile, tx, tz);
            if (!usedTile || !surrounded) {
                const point = (xi, zi) => (x * dn + xi * dn) * 65 + z * dn + zi * dn;
                const isShore = usedTile && usedTile[tx * 64 + tz] !== undefined && !surrounded;
                const isEdge = (xi, zi) => isShore && !isInBetween(usedTile, tx, tz, xi, zi);
                const r = (isShore && usedTile[tx * 64 + tz]) || 0;
                const s = 1 - r;
                push.apply(
                    geometries.sea.positions,
                    getSeaPositions(
                        section,
                        [point(0, r), point(s, 0), point(1, s)],
                        [isEdge(0, r), isEdge(s, 0), isEdge(1, s)]
                    )
                );
                push.apply(
                    geometries.sea.positions,
                    getSeaPositions(
                        section,
                        [point(1, s), point(r, 1), point(0, r)],
                        [isEdge(1, s), isEdge(r, 1), isEdge(0, r)]
                    )
                );
            }
        }
    }
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
    for (let i = 0; i < 3; ++i) {
        const idx = points[i];
        const x = section.x * 32 + (65 - Math.floor(idx / 65)) - 32;
        const z = section.z * 32 + (idx % 65);
        positions.push(x / 32, isEdge[i] ? 0 : 1, z / 32);
    }
    return positions;
}
