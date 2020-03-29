import { getResource } from '../resources';

export async function loadSceneMapData() {
    const bkg = await getResource('BRICKS');
    return loadSceneMap(bkg);
}

function loadSceneMap(bkg) {
    const buffer = bkg.getEntry(18100); // last entry
    const data = new DataView(buffer);
    let offset = 0;
    const map = [];

    while (true) {
        const opcode = data.getUint8(offset);
        const index = data.getUint8(offset + 1);
        offset += 2;
        if (opcode === 0) {
            break;
        }

        map.push({
            isIsland: opcode === 2,
            index
        });
    }
    return map;
}
