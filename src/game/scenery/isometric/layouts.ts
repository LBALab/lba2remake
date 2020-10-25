const cachedLayouts = {};

export function loadLayout(bkg, layout) {
    const { library, index } = layout;
    const key = `${library}_${index}`;
    if (key in cachedLayouts) {
        return cachedLayouts[key];
    }
    const buffer = bkg.getEntry(179 + library);

    const dataView = new DataView(buffer);
    const numLayouts = dataView.getUint32(0, true) / 4;

    const offset = dataView.getUint32(index * 4, true);
    const nextOffset = index === numLayouts - 1 ?
        dataView.byteLength
        : dataView.getUint32((index + 1) * 4, true);

    const layoutDataView = new DataView(buffer, offset, nextOffset - offset);
    const nX = layoutDataView.getUint8(0);
    const nY = layoutDataView.getUint8(1);
    const nZ = layoutDataView.getUint8(2);
    const numBricks = nX * nY * nZ;
    const bricks = [];
    const lOffset = 3;
    for (let i = 0; i < numBricks; i += 1) {
        bricks.push(layoutDataView.getUint16(lOffset + (i * 4) + 2, true));
    }
    const layoutInfo = {
        index,
        nX,
        nY,
        nZ,
        bricks
    };
    cachedLayouts[key] = layoutInfo;
    return layoutInfo;
}
