export function loadLayout(ile) {
    const layout_raw = new Uint8Array(ile.getEntry(0));
    const layout = [];
    let index = 0;
    for (let i = 0; i < 256; ++i) {
        const x = Math.floor(i / 16);
        const z = i % 16;
        if (layout_raw[i]) {
            const id = layout_raw[i];
            layout.push({
                type: 'ground',
                id: id,
                index: index++,
                x: (16 - x) - 8,
                z: z - 8,
                objInfo: parseObjectsInfo(ile.getEntry(id * 6 - 3)),
                objects: new DataView(ile.getEntry(id * 6 - 2)),
                triangles: new Uint32Array(ile.getEntry(id * 6 - 1)),
                textureInfo: new Uint8Array(ile.getEntry(id * 6)),
                heightmap: new Uint16Array(ile.getEntry(id * 6 + 1)),
                intensity: new Uint8Array(ile.getEntry(id * 6 + 2))
            });
        } else {
            const distanceFromGround = computeDistanceFromGround(layout_raw, x, z);
            if (distanceFromGround) {
                layout.push({
                    type: 'sea',
                    x: (16 - x) - 8,
                    z: z - 8,
                    distanceFromGround: distanceFromGround
                });
            }
        }
    }
    return layout;
}

function computeDistanceFromGround(layout_raw, x, z) {
    for (let d = 1; d < 5; ++d) {
        for (let dx = x - d; dx <= x + d; ++dx) {
            for (let dz = z - d; dz <= z + d; ++dz) {
                if (Math.abs(dx - x) == d || Math.abs(dz - z) == d) {
                    if (dx >= 0 && dz >= 0 && dx < 16 && dz < 16 && layout_raw[dx * 16 + dz]) {
                        return d;
                    }
                }
            }
        }
    }
}

function parseObjectsInfo(buffer) {
    const dataView = new DataView(buffer);
    return {
        numObjects: dataView.getUint32(8, true)
    };
}
