import {find} from 'lodash';
import {getTriangleFromPos} from './ground';

export function loadIslandPhysics(layout) {
    return {
        getGroundInfo: getGroundInfo.bind(null, layout)
    }
}

function getGroundInfo(layout, x, z) {
    const e = 1 / 32;
    const section = find(layout.groundSections, gs => x - e > gs.x * 2 && x - e <= gs.x * 2 + 2 && z >= gs.z * 2 && z <= gs.z * 2 + 2);
    if (section) {
        const xLocal = (2.0 - (x - section.x * 2)) * 32 + 1;
        const zLocal = (z - section.z * 2) * 32;
        const xFloor = Math.floor(xLocal);
        const zFloor = Math.floor(zLocal);
        const t = getTriangleFromPos(section, xLocal, zLocal);
        const h = t.getHeight(xLocal - xFloor, zLocal - zFloor);
        return {
            height: h.h,
            sound: t.sound,
            collision: t.collision,
            orientation: t.orientation,
            x: xFloor,
            z: zFloor,
            index: t.index,
            points: t.points.map(pt => `\n${pt.x}, ${pt.z} => ${section.heightmap[(xFloor + pt.x) * 65 + zFloor + pt.z]}`),
            expr: h.expr
        };
    } else {
        return {
            height: 0,
            sound: 0,
            collision: 0
        };
    }
}