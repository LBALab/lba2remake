import {loadHqr} from '../hqr';

export async function loadSceneMapData() {
    const bkg = await loadHqr('LBA_BKG.HQR');
    return loadSceneMap(bkg);
}

function loadSceneMap(bkg) {
    const buffer = bkg.getEntry(18100); // last entry
    const data = new DataView(buffer);
    let offset = 0;
    const map = [];

    // eslint-disable-next-line no-constant-condition
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
