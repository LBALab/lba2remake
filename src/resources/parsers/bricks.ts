import { Resource } from '../load';
import { bits } from '../../utils';

export const parseBrick = (resource: Resource, index: number) => {
    const dataView = new DataView(resource.getEntry(index));
    const height = dataView.getUint8(1);
    const offsetX = dataView.getUint8(2);
    const offsetY = dataView.getUint8(3);
    const buffer = new ArrayBuffer(48 * 38);
    const pixels = new Uint8Array(buffer);
    let ptr = 4;
    for (let y = 0; y < height; y += 1) {
        const numRuns = dataView.getUint8(ptr);
        ptr += 1;
        let x = 0;
        const offset = () => ((y + offsetY) * 48) + x + offsetX;
        for (let run = 0; run < numRuns; run += 1) {
            const runSpec = dataView.getUint8(ptr);
            ptr += 1;
            const runLength = bits(runSpec, 0, 6) + 1;
            const type = bits(runSpec, 6, 2);
            if (type === 2) {
                const color = dataView.getUint8(ptr);
                ptr += 1;
                for (let i = 0; i < runLength; i += 1) {
                    pixels[offset()] = color;
                    x += 1;
                }
            } else if (type === 1 || type === 3) {
                for (let i = 0; i < runLength; i += 1) {
                    pixels[offset()] = dataView.getUint8(ptr);
                    ptr += 1;
                    x += 1;
                }
            } else {
                x += runLength;
            }
        }
    }
    return pixels;
};
