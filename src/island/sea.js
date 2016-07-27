const push = Array.prototype.push;

export function loadSea(section, geometries, usedTile, offsetX, offsetZ) {
    const n = Math.pow(2, 2 - section.lod) * 8;
    const dn = 32 / n;
    for (let x = 0; x < n; ++x) {
        const tx = x * dn + offsetX * 32;
        for (let z = 0; z < n; ++z) {
            const tz = z * dn + offsetZ * 32;
            if (!usedTile || !isSurrounded(usedTile, tx, tz)) {
                const point = (xi, yi) => (x * dn + xi) * 65 + z * dn + yi;
                const shore = usedTile && usedTile[tx * 64 + tz] && !isSurrounded(usedTile, tx, tz);
                push.apply(geometries.sea.positions, getSeaPositions(section, [point(0, dn), point(0, 0), point(dn, 0)], shore));
                push.apply(geometries.sea.positions, getSeaPositions(section, [point(dn, 0), point(dn, dn), point(0, dn)], shore));
            }
        }
    }
}

function isSurrounded(usedTile, x, z) {
    const used = (x, z) => {
        return x < 0 || z < 0 || x >= 64 || z >= 64 || usedTile[x * 64 + z];
    };

    return _.every([
        used(x - 1, z - 1),
        used(x - 1, z),
        used(x - 1, z + 1),
        used(x, z - 1),
        used(x, z),
        used(x, z + 1),
        used(x + 1, z - 1),
        used(x + 1, z),
        used(x + 1, z + 1)
    ]);
}

function getSeaPositions(section, points, shore) {
    const positions = [];
    for (let i = 0; i < 3; ++i) {
        const idx = points[i];
        const x = section.x * 32 + (65 - Math.floor(idx / 65)) - 32;
        const z = section.z * 32 + (idx % 65);
        positions.push(x / 32, shore ? 0.01 : 0, z / 32);
    }
    return positions;
}
