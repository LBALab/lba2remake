import {map} from 'lodash';
import {bits} from '../utils';
import {loadBricksMap} from './map';

export function loadGrid(bkg, bricks, palette, entry) {
    const gridData = new DataView(bkg.getEntry(entry));
    const library = gridData.getUint8(0);
    const maxOffset = 34 + 4096 * 2;
    const offsets = [];
    for (let i = 34; i < maxOffset; i += 2) {
        offsets.push(gridData.getUint16(i, true) + 34);
    }
    return {
        library: loadLibrary(bkg, bricks, palette, 179 + library),
        cells: map(offsets, offset => {
            const columns = [];
            const numColumns = gridData.getUint8(offset++);
            for (let i = 0; i < numColumns; ++i) {
                const flags = gridData.getUint8(offset++);
                const column = {
                    type: bits(flags, 6, 2),
                    height: bits(flags, 0, 4)
                };
                switch (column.type) {
                    case 1:
                        const blocks = [];
                        for (let j = 0; j <= column.height; ++j) {
                            blocks.push({
                                layoutIdx: gridData.getUint8(offset++),
                                blockIdx: gridData.getUint8(offset++)
                            });
                        }
                        break;
                    case 2:
                        column.block = {
                            layoutIdx: gridData.getUint8(offset++),
                            blockIdx: gridData.getUint8(offset++)
                        };
                        break;
                    case 0:
                    default:
                        break;
                }

                columns.push(column);
            }
            return columns;
        })
    };
}

function loadLibrary(bkg, bricks, palette, entry) {
    const buffer = bkg.getEntry(entry);
    const dataView = new DataView(buffer);
    const numLayouts = dataView.getUint32(0, true) / 4;
    const layouts = [];
    for (let i = 0; i < numLayouts; ++i) {
        const offset = dataView.getUint32(i * 4, true);
        const nextOffset = i == numLayouts - 1 ? dataView.byteLength : dataView.getUint32((i + 1) * 4, true);
        const layoutDataView = new DataView(buffer, offset, nextOffset - offset);
        layouts.push(loadLayout(layoutDataView));
    }
    const bricksMap = loadBricksMap(layouts, bricks, palette);
    return {
        texture: bricksMap.texture,
        layouts: map(layouts, makeLayoutBuilder.bind(null, bricksMap.map))
    };
}

function loadLayout(dataView) {
    const nX = dataView.getUint8(0);
    const nY = dataView.getUint8(1);
    const nZ = dataView.getUint8(2);
    const numBricks = nX * nY * nZ;
    const blocks = [];
    const offset = 3;
    for (let i = 0; i < numBricks; ++i) {
        const type = dataView.getUint8(offset + i * 4 + 1);
        blocks.push({
            shape: dataView.getUint8(offset + i * 4),
            sound: bits(type, 0, 4),
            groundType: bits(type, 4, 4),
            brick: dataView.getUint16(offset + i * 4 + 2, true)
        });
    }
    return {
        nX: nX,
        nY: nY,
        nZ: nZ,
        blocks: blocks
    };
}

function makeLayoutBuilder(bricksMap, layout) {
    const blocks = layout.blocks;
    return {
        build: function({positions, uvs}) {
            let i = 0;
            let activeBlocks = 0;
            for (let z = 0; z < layout.nZ; ++z) {
                for (let y = 0; y < layout.nY; ++y) {
                    for (let x = 0; x < layout.nX; ++x) {
                        if (blocks[i].brick) {
                            const offset = bricksMap[blocks[i].brick];
                            const u = offset.x;
                            const v = offset.y;

                            const {px, py} = getPosition(x, y, z);

                            // First triangle
                            positions.push(px, py, 0);
                            uvs.push(u / 1024, v / 1024);

                            positions.push(px + 48, py, 0);
                            uvs.push((u + 48) / 1024, v / 1024);

                            positions.push(px + 48, py + 38, 0);
                            uvs.push((u + 48) / 1024, (v + 38) / 1024);

                            // Second triangle
                            positions.push(px, py, 0);
                            uvs.push(u / 1024, v / 1024);

                            positions.push(px + 48, py + 38, 0);
                            uvs.push((u + 48) / 1024, (v + 38) / 1024);

                            positions.push(px, py + 38, 0);
                            uvs.push(u / 1024, (v + 38) / 1024);

                            activeBlocks++;
                        }
                        i++;
                    }
                }
            }
            console.log('Blocks:', activeBlocks, '/', blocks.length);
        }
    };
}

function getPosition(x, y, z) {
    return {
        px: (x - z) * 24,
        py: (x + z) * 12 - y * 15
    }
}
