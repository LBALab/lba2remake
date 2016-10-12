import {map} from 'lodash';
import {bits} from '../utils';
import {loadBricksMapping, MAP_SIZE} from './map';

export function loadGrid(bkg, bricks, palette, entry) {
    const gridData = new DataView(bkg.getEntry(entry));
    const libIndex = gridData.getUint8(0);
    const maxOffset = 34 + 4096 * 2;
    const offsets = [];
    for (let i = 34; i < maxOffset; i += 2) {
        offsets.push(gridData.getUint16(i, true) + 34);
    }
    const library = loadLibrary(bkg, bricks, palette, 179 + libIndex);
    return {
        library: library,
        cells: map(offsets, offset => {
            const blocks = [];
            const numColumns = gridData.getUint8(offset++);
            for (let i = 0; i < numColumns; ++i) {
                const flags = gridData.getUint8(offset++);
                const type = bits(flags, 6, 2);
                const height = bits(flags, 0, 4);
                const block = type == 2 ? {
                    layout: gridData.getUint8(offset++) - 1,
                    block: gridData.getUint8(offset++)
                } : null;

                for (let j = 0; j <= height; ++j) {
                    switch (type) {
                        case 1:
                            blocks.push({
                                layout: gridData.getUint8(offset++) - 1,
                                block: gridData.getUint8(offset++)
                            });
                            break;
                        case 2:
                            blocks.push(block);
                            break;
                        case 0:
                        default:
                            blocks.push(null);
                            break;
                    }
                }
            }
            return {
                build: buildCell.bind(null, library, blocks)
            };
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
    const mapping = loadBricksMapping(layouts, bricks, palette);
    return {
        texture: mapping.texture,
        bricksMap: mapping.bricksMap,
        layouts: layouts
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

function buildCell(library, blocks, geometries, x, z) {
    const {positions, uvs} = geometries;
    for (let y = 0; y < blocks.length; ++y) {
        if (blocks[y]) {
            const layout = library.layouts[blocks[y].layout];
            if (layout) {
                const block = layout.blocks[blocks[y].block];
                if (block && block.brick) {
                    const {u, v} = library.bricksMap[block.brick];
                    const {px, py} = getPosition(x, y, z);

                    // First triangle
                    positions.push(px, py, 0);
                    uvs.push(u / MAP_SIZE, v / MAP_SIZE);

                    positions.push(px + 48, py, 0);
                    uvs.push((u + 48) / MAP_SIZE, v / MAP_SIZE);

                    positions.push(px + 48, py + 38, 0);
                    uvs.push((u + 48) / MAP_SIZE, (v + 38) / MAP_SIZE);

                    // Second triangle
                    positions.push(px, py, 0);
                    uvs.push(u / MAP_SIZE, v / MAP_SIZE);

                    positions.push(px + 48, py + 38, 0);
                    uvs.push((u + 48) / MAP_SIZE, (v + 38) / MAP_SIZE);

                    positions.push(px, py + 38, 0);
                    uvs.push(u / MAP_SIZE, (v + 38) / MAP_SIZE);
                }
            }
        }
    }
}

function getPosition(x, y, z) {
    return {
        px: (x - z) * 24,
        py: (x + z) * 12 - y * 15
    }
}
