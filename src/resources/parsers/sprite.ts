import { Resource } from '../load';
import { bits } from '../../utils';

const CLIP_INFO_SIZE = 16;

const parseSpriteClipInfo = (resource: Resource) => {
    const buffer = resource.getBuffer();
    const numEntries = buffer.byteLength / CLIP_INFO_SIZE;
    const entries = [];
    const rDataView = new DataView(buffer);
    for (let index = 0; index < numEntries; index += 1) {
        const rOffset = (index * CLIP_INFO_SIZE) + 4;
        entries.push({
            xMin: rDataView.getInt16(rOffset, true),
            xMax: rDataView.getInt16(rOffset + 2, true),
            yMin: rDataView.getInt16(rOffset + 4, true),
            yMax: rDataView.getInt16(rOffset + 6, true),
            zMin: rDataView.getInt16(rOffset + 8, true),
            zMax: rDataView.getInt16(rOffset + 10, true),
        });
    }
    return entries;
};

const parseSprite = (resource: Resource, index: number) => {
    const dataView = new DataView(resource.getEntry(index));
    const width = dataView.getUint8(8);
    const height = dataView.getUint8(9);
    const offsetX = dataView.getUint8(10);
    const offsetY = dataView.getUint8(11);
    const buffer = new ArrayBuffer(width * height);
    const pixels = new Uint8Array(buffer);
    let ptr = 12;
    for (let y = 0; y < height; y += 1) {
        const numRuns = dataView.getUint8(ptr);
        ptr += 1;
        let x = 0;
        const offset = () => ((y + offsetY) * width) + x + offsetX;
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
    return {
        width,
        height,
        offsetX,
        offsetY,
        pixels,
        index,
    };
};

const parseSpriteRaw = (resource: Resource, index: number) => {
    const dataView = new DataView(resource.getEntry(index));
    const width = dataView.getUint8(8);
    const height = dataView.getUint8(9);
    const buffer = new ArrayBuffer(width * height);
    const pixels = new Uint8Array(buffer);
    let ptr = 12;
    for (let y = 0; y < height; y += 1) {
        let x = 0;
        const offset = () => (y * width) + x;
        for (let run = 0; run < width; run += 1) {
            pixels[offset()] = dataView.getUint8(ptr);
            ptr += 1;
            x += 1;
        }
    }
    return {
        width,
        height,
        offsetX: 0,
        offsetY: 0,
        pixels,
        index,
    };
};

export { parseSpriteClipInfo, parseSprite, parseSpriteRaw };
