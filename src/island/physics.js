import {find} from 'lodash';

export function loadIslandPhysics(layout) {
    return {
        getGroundHeight: getGroundHeight.bind(null, layout)
    }
}

function getGroundHeight(layout, x, z) {
    const e = 1 / 32;
    const section = find(layout.groundSections, gs => x - e > gs.x * 2 && x - e <= gs.x * 2 + 2 && z >= gs.z * 2 && z <= gs.z * 2 + 2);
    if (section) {
        const dx = (2.0 - (x - section.x * 2)) * 32 + 1;
        const dz = (z - section.z * 2) * 32;
        const ix = Math.floor(dx);
        const iz = Math.floor(dz);
        const height = (ox, oz) => section.heightmap[(ix + ox) * 65 + iz + oz] / 0x4000;
        const ax = dx - ix;
        const az = dz - iz;
        const r1 = (1.0 - ax) * height(0, 0) + ax * height(1, 0);
        const r2 = (1.0 - ax) * height(0, 1) + ax * height(1, 1);
        return (1.0 - az) * r1 + az * r2;
    } else {
        return 0.0;
    }
}