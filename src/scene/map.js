import async from 'async';
import _ from 'lodash';

import {loadHqrAsync} from '../hqr';

export function loadSceneMapData(callback) {
    async.auto({
        bkg: loadHqrAsync('LBA_BKG.HQR')
    }, function(err, files) {
        callback(loadSceneMap(files));
    });
}

function loadSceneMap(files) {
    const buffer = files.bkg.getEntry(18100); // last entry
    const data = new DataView(buffer);
    let offset = 0;
    const map = [];

    while (true) {
        const opcode = data.getUint8(offset++, true);
        const index = data.getUint8(offset++, true);
        if (opcode == 0) {
            break;
        }

        map.push({
            isIsland: (opcode == 2) ? true : false,
            index: index
        });
    }
    return map;
}
