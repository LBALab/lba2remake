import * as THREE from 'three';
import {map, each, range, last} from 'lodash';
import {bits} from '../utils';
import {loadBricksMapping} from './mapping';

export function loadGrid(bkg, bricks, palette, entry) {
    const gridData = new DataView(bkg.getEntry(entry));
    const libIndex = gridData.getUint8(0);
    const maxOffset = 34 + 4096 * 2;
    const offsets = [];
    for (let i = 34; i < maxOffset; i += 2) {
        offsets.push(gridData.getUint16(i, true) + 34);
    }
    const library = loadLibrary(bkg, bricks, palette, libIndex);
    return {
        library,
        cells: map(offsets, (offset, idx) => {
            const blocks = [];
            const numColumns = gridData.getUint8(offset);
            offset += 1;
            const columns = [];
            let baseHeight = 0;
            for (let i = 0; i < numColumns; i += 1) {
                const flags = gridData.getUint8(offset);
                offset += 1;
                const type = bits(flags, 6, 2);
                const height = bits(flags, 0, 5) + 1;

                const block = type === 2 ? {
                    layout: gridData.getUint8(offset) - 1,
                    block: gridData.getUint8(offset + 1)
                } : null;

                if (block)
                    offset += 2;

                for (let j = 0; j < height; j += 1) {
                    switch (type) {
                        case 0:
                            blocks.push(null);
                            break;
                        case 1:
                            blocks.push({
                                layout: gridData.getUint8(offset) - 1,
                                block: gridData.getUint8(offset + 1)
                            });
                            offset += 2;
                            break;
                        case 2:
                            blocks.push(block);
                            break;
                        case 3:
                            throw new Error('Unsupported block type');
                    }
                }
                if (type !== 0) {
                    const x = Math.floor(idx / 64) - 1;
                    const z = idx % 64;

                    const blockData = getBlockData(library, last(blocks));
                    columns.push({
                        shape: (blockData && blockData.shape) || 1,
                        box: new THREE.Box3(
                            new THREE.Vector3(
                                (63 - x) / 32,
                                baseHeight / 64,
                                z / 32
                            ),
                            new THREE.Vector3(
                                (64 - x) / 32,
                                (baseHeight + height) / 64,
                                (z + 1) / 32
                            )
                        ),
                        sound: (blockData && blockData.sound) || -1
                    });
                }
                baseHeight += height;
            }
            return {
                build: buildCell.bind(null, library, blocks),
                columns
            };
        })
    };
}

function getBlockData(library, block) {
    const layout = library.layouts[block.layout];
    if (layout) {
        return layout.blocks[block.block];
    }
    return null;
}

const libraries = [];

function loadLibrary(bkg, bricks, palette, entry) {
    if (libraries[entry]) {
        return libraries[entry];
    }
    const buffer = bkg.getEntry(179 + entry);
    const dataView = new DataView(buffer);
    const numLayouts = dataView.getUint32(0, true) / 4;
    const layouts = [];
    for (let i = 0; i < numLayouts; i += 1) {
        const offset = dataView.getUint32(i * 4, true);
        const nextOffset = i === numLayouts - 1 ?
            dataView.byteLength
            : dataView.getUint32((i + 1) * 4, true);
        const layoutDataView = new DataView(buffer, offset, nextOffset - offset);
        layouts.push(loadLayout(layoutDataView));
    }
    const mapping = loadBricksMapping(layouts, bricks, palette);
    const library = {
        texture: mapping.texture,
        bricksMap: mapping.bricksMap,
        layouts
    };
    libraries[entry] = library;
    return library;
}

function loadLayout(dataView) {
    const nX = dataView.getUint8(0);
    const nY = dataView.getUint8(1);
    const nZ = dataView.getUint8(2);
    const numBricks = nX * nY * nZ;
    const blocks = [];
    const offset = 3;
    for (let i = 0; i < numBricks; i += 1) {
        const type = dataView.getUint8(offset + i * 4 + 1);
        blocks.push({
            shape: dataView.getUint8(offset + i * 4),
            sound: bits(type, 0, 4),
            groundType: bits(type, 4, 4),
            brick: dataView.getUint16(offset + i * 4 + 2, true)
        });
    }
    return {
        nX,
        nY,
        nZ,
        blocks
    };
}

function buildCell(library, blocks, geometries, x, z) {
    const h = 0.5;
    const {positions, centers, tiles} = geometries;
    const {width, height} = library.texture.image;
    for (let yIdx = 0; yIdx < blocks.length; yIdx += 1) {
        const y = yIdx * h + h;
        if (blocks[yIdx]) {
            const layout = library.layouts[blocks[yIdx].layout];
            if (layout) {
                const block = layout.blocks[blocks[yIdx].block];
                if (block && block.brick) {
                    const {u, v} = library.bricksMap[block.brick];

                    positions.push(x, y, z);
                    positions.push(x, y, z + 1);
                    positions.push(x + 1, y, z);
                    positions.push(x + 1, y, z);
                    positions.push(x, y, z + 1);
                    positions.push(x + 1, y, z + 1);

                    positions.push(x + 1, y, z);
                    positions.push(x + 1, y, z + 1);
                    positions.push(x + 1, y - h, z + 1);
                    positions.push(x + 1, y, z);
                    positions.push(x + 1, y - h, z + 1);
                    positions.push(x + 1, y - h, z);

                    positions.push(x, y, z + 1);
                    positions.push(x + 1, y - h, z + 1);
                    positions.push(x + 1, y, z + 1);
                    positions.push(x, y, z + 1);
                    positions.push(x, y - h, z + 1);
                    positions.push(x + 1, y - h, z + 1);

                    each(range(18), () => {
                        centers.push(x + 0.5, y - h * 0.5, z + 0.5);
                        tiles.push(u / width, v / height);
                    });
                }
            }
        }
    }
}

