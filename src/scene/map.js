import async from 'async';

import {loadHqrAsync} from '../hqr';

export function loadSceneMapData(callback) {
    async.auto({
        bkg: loadHqrAsync('LBA_BKG.HQR')
    }, (err, files) => {
        callback(loadSceneMap(files));
    });
}

function loadSceneMap(files) {
    const buffer = files.bkg.getEntry(18100); // last entry
    const data = new DataView(buffer);
    let offset = 0;
    const map = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const opcode = data.getUint8(offset, true);
        const index = data.getUint8(offset + 1, true);
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
