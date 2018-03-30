import {each} from 'lodash';

export function loadLayout(ile) {
    const groundSections = loadGroundSections(ile);
    const seaSections = loadSeaSections(groundSections);
    return {
        groundSections,
        seaSections
    };
}

function loadGroundSections(ile) {
    const layout_raw = new Uint8Array(ile.getEntry(0));
    const groundSections = [];
    let index = 0;
    for (let i = 0; i < 256; i += 1) {
        const x = Math.floor(i / 16);
        const z = i % 16;
        if (layout_raw[i]) {
            const id = layout_raw[i];
            groundSections.push({
                id,
                index,
                x: (16 - x) - 8,
                z: z - 8,
                objInfo: parseObjectsInfo(ile.getEntry(id * 6 - 3)),
                objects: new DataView(ile.getEntry(id * 6 - 2)),
                triangles: new Uint32Array(ile.getEntry(id * 6 - 1)),
                textureInfo: new Uint8Array(ile.getEntry(id * 6)),
                heightmap: new Uint16Array(ile.getEntry(id * 6 + 1)),
                intensity: new Uint8Array(ile.getEntry(id * 6 + 2))
            });
            index += 1;
        }
    }
    return groundSections;
}

function loadSeaSections(groundSections) {
    const seaSections = [];
    const indexedSections = {};
    for (let x = -14; x <= 16; x += 1) {
        for (let z = -16; z <= 14; z += 1) {
            const distanceFromGround = computeDistanceFromGround(groundSections, x, z);
            if (distanceFromGround < 12) {
                const section = {
                    x,
                    z,
                    lod: Math.min(distanceFromGround, 5),
                    reduceEdges: []
                };
                seaSections.push(section);
                indexedSections[[x, z].join(',')] = section;
            }
        }
    }
    const nbs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    each(indexedSections, (section) => {
        if (section.lod === 0)
            return;
        each(nbs, (nb) => {
            const nearSection = indexedSections[[section.x - nb[0], section.z + nb[1]]];
            if (nearSection && nearSection.lod < section.lod) {
                section.reduceEdges.push(nb.join(','));
            }
        });
    });
    return seaSections;
}

function computeDistanceFromGround(groundSections, x, z) {
    let minLength = 32;
    each(groundSections, (section) => {
        const sx = section.x * 2;
        const sz = section.z * 2;
        for (let i = 0; i < 4; i += 1) {
            const dx = Math.floor(i / 2);
            const dz = i % 2;
            const length = Math.sqrt(Math.pow(sx + dx - x, 2) + Math.pow(sz + dz - z, 2));
            minLength = Math.min(minLength, Math.floor(length));
        }
    });
    return minLength;
}

function parseObjectsInfo(buffer) {
    const dataView = new DataView(buffer);
    return {
        numObjects: dataView.getUint32(8, true)
    };
}
