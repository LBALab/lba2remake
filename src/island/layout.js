import {each} from 'lodash';

export function loadLayout(ile) {
    const groundSections = loadGroundSections(ile);
    const seaSections = loadSeaSections(groundSections);
    return {
        groundSections: groundSections,
        seaSections: seaSections
    };
}

function loadGroundSections(ile) {
    const layout_raw = new Uint8Array(ile.getEntry(0));
    const groundSections = [];
    let index = 0;
    for (let i = 0; i < 256; ++i) {
        const x = Math.floor(i / 16);
        const z = i % 16;
        if (layout_raw[i]) {
            const id = layout_raw[i];
            groundSections.push({
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
        }
    }
    return groundSections;
}

function loadSeaSections(groundSections) {
    const seaSections = [];
    for (let x = -14; x <= 16; ++x) {
        for (let z = -16; z <= 14; ++z) {
            const distanceFromGround = computeDistanceFromGround(groundSections, x, z);
            if (distanceFromGround > 0 && distanceFromGround < 12) {
                seaSections.push({
                    x: x,
                    z: z,
                    lod: Math.min(distanceFromGround, 5)
                });
            }
        }
    }
    return seaSections;
}

function computeDistanceFromGround(groundSections, x, z) {
    let minLength = 32;
    each(groundSections, section => {
        const sx = section.x * 2;
        const sz = section.z * 2;
        for (let i = 0; i < 4; ++i) {
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
