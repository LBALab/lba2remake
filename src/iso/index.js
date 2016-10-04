import async from 'async';
import {loadHqrAsync} from '../hqr';
import {bits} from '../utils';

export function loadIsoSceneManager() {
    const scene = {};
    loadBricks(() => {});
    return {
        currentScene: () => scene
    }
}

export function loadBricks(callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        bkg: loadHqrAsync('LBA_BKG.HQR')
    }, function(err, files) {
        for (let i = 197; i < 18099; ++i) {
            loadBrick(files, i);
        }
        console.log('done loading bricks');
        callback();
    });
}

export function loadBrick(files, entry) {
    const brickData = new DataView(files.bkg.getEntry(entry));
    const width = brickData.getUint8(0);
    const height = brickData.getUint8(1);
    const offsetX = brickData.getUint8(2);
    const offsetY = brickData.getUint8(3);
    const buffer = new ArrayBuffer(width * height);
    const pixels = new Uint8Array(buffer);
    let ptr = 4;
    for (let y = 0; y < height; ++y) {
        const numRuns = brickData.getUint8(ptr++);
        let x = 0;
        for (let run = 0; run < numRuns; ++run) {
            const runSpec = brickData.getUint8(ptr++);
            const runLength = bits(runSpec, 0, 6) + 1;
            const type = bits(runSpec, 6, 2);
            if (type == 2) {
                const color = brickData.getUint8(ptr++);
                for (let i = 0; i < runLength; ++i) {
                    pixels[x] = color;
                    x++;
                }
            }
            else if (type == 1 || type == 3) {
                for (let i = 0; i < runLength; ++i) {
                    const color = brickData.getUint8(ptr++);
                    pixels[x] = color;
                    x++;
                }
            }
            else {
                x += runLength;
            }
        }
    }
}
