import async from 'async';
import {loadHqrAsync} from '../hqr';
import {loadLayout} from './layout';
import {loadGround} from './ground';

export default function(name, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        ile: loadHqrAsync(`${name}.ILE`)
    }, function(err, files) {
        const island = {
            files: files,
            palette: new Uint8Array(files.ress.getEntry(0)),
            layout: loadLayout(files.ile)
        };
        callback(loadGround(island));
    });
}
