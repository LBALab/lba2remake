import { Resource } from '../load';
import { bits } from '../../utils';

const parseLibrary = (resource: Resource, index: number) => {
    const buffer = resource.getEntry(resource.first + index);
    const dataView = new DataView(buffer);
    const numLayouts = dataView.getUint32(0, true) / 4;
    const layouts = [];
    for (let i = 0; i < numLayouts; i += 1) {
        const offset = dataView.getUint32(i * 4, true);
        const nextOffset = i === numLayouts - 1 ?
            dataView.byteLength
            : dataView.getUint32((i + 1) * 4, true);
        const layoutDataView = new DataView(buffer, offset, nextOffset - offset);
        layouts.push(parseLayout(layoutDataView, i));
    }
    return layouts;
};

const parseLayout = (dataView, index) => {
    const nX = dataView.getUint8(0);
    const nY = dataView.getUint8(1);
    const nZ = dataView.getUint8(2);
    const numBricks = nX * nY * nZ;
    const blocks = [];
    const offset = 3;
    for (let i = 0; i < numBricks; i += 1) {
        const type = dataView.getUint8(offset + (i * 4) + 1);
        blocks.push({
            shape: dataView.getUint8(offset + (i * 4)),
            sound: bits(type, 0, 4),
            groundType: bits(type, 4, 4),
            brick: dataView.getUint16(offset + (i * 4) + 2, true)
        });
    }
    return {
        index,
        nX,
        nY,
        nZ,
        blocks
    };
};

export { parseLibrary };
