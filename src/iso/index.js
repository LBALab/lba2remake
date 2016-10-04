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
    const offsetX = brickData.getUint8(0);
    const offsetY = brickData.getUint8(1);
    const width = brickData.getUint8(2);
    const height = brickData.getUint8(3);
    let ptr = 4;
    const buffer = new ArrayBuffer(width * height);
    const pixels = new Uint8Array(buffer);
    let offset = 0;
    while (offset < width * height) {
        const numRuns = brickData.getUint8(ptr++);
        for (let run = 0; run < numRuns; ++run) {
            const runSpec = brickData.getUint8(ptr++);
            const runLength = bits(runSpec, 0, 6);
            const colorFlag = bits(runSpec, 6, 1);
            const copyFlag = bits(runSpec, 7, 1);
            if (colorFlag) {
                const color = brickData.getUint8(ptr++);
                for (let i = 0; i < runLength; ++i) {
                    pixels[offset] = color;
                    offset++;
                }
            }
            else if (copyFlag) {
                for (let i = 0; i < runLength; ++i) {
                    const color = brickData.getUint8(ptr++);
                    pixels[offset] = color;
                    offset++;
                }
            }
            else {
                offset += runLength;
            }
        }
    }
}
