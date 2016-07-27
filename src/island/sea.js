const push = Array.prototype.push;

export function loadSea(section, geometries) {
    function loadQuads(n) {
        const dn = 32 / n;
        for (let x = 0; x < n; ++x) {
            for (let y = 0; y < n; ++y) {
                const point = (xi, yi) => (x * dn + xi) * 65 + y * dn + yi;
                push.apply(geometries.sea.positions, getSeaPositions(section, [point(0, dn), point(0, 0), point(dn, 0)]));
                push.apply(geometries.sea.positions, getSeaPositions(section, [point(dn, 0), point(dn, dn), point(0, dn)]));
            }
        }
    }

    loadQuads(Math.pow(2, 2 - section.lod) * 8);
}

function getSeaPositions(section, points) {
    const positions = [];
    for (let i = 0; i < 3; ++i) {
        const idx = points[i];
        const x = section.x * 32 + (65 - Math.floor(idx / 65)) - 32;
        const z = section.z * 32 + (idx % 65);
        positions.push(x / 32, 0, z / 32);
    }
    return positions;
}
