import async from 'async';
import {loadHqrAsync} from '../hqr';
import {loadSubTexture} from '../texture';
import {loadLayout} from './layout';
import {loadGround} from './ground';

export default function(name, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        ile: loadHqrAsync(`${name}.ILE`)
    }, function(err, data) {
        const palette = new Uint8Array(data.ress.getEntry(0));
        const layout = loadLayout(data.ile);
        const ground_texture = loadSubTexture(data.ile.getEntry(1), palette, 0, 0, 32, 32);
        console.log(layout);
        callback(loadGround(layout, palette, ground_texture));
    });
}
