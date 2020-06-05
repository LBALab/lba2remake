import * as THREE from 'three';
import {map, last} from 'lodash';
import {bits} from '../utils';
import {loadBricksMapping} from './mapping';

export async function loadGrid(bkg, bricks, mask, palette, entry) {
    const gridData = new DataView(bkg.getEntry(entry));
    const libIndex = gridData.getUint8(0);
    const maxOffset = 34 + (4096 * 2);
    const offsets = [];
    for (let i = 34; i < maxOffset; i += 2) {
        offsets.push(gridData.getUint16(i, true) + 34);
    }
    const library = loadLibrary(bkg, bricks, mask, palette, libIndex);
    const gridMetadata = await getGridMetadata(entry);
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

                let isValid = false;

                for (let j = 0; j < height; j += 1) {
                    const yGrid = baseHeight + j;
                    switch (type) {
                        case 0:
                            blocks.push(null);
                            break;
                        case 1: {
                            const layout = gridData.getUint8(offset) - 1;
                            if (layout !== -1) {
                                isValid = true;
                                blocks.push({
                                    layout,
                                    block: gridData.getUint8(offset + 1)
                                });
                            } else {
                                blocks.push(null);
                            }

                            offset += 2;
                            break;
                        }
                        case 2:
                            if (block && block.layout !== -1 && block.block !== -1) {
                                isValid = true;
                                blocks.push(block);
                            } else {
                                blocks.push(null);
                            }
                            break;
                        case 3:
                            throw new Error('Unsupported block type');
                    }
                    if (gridMetadata
                        && idx in gridMetadata
                        && yGrid in gridMetadata[idx]) {
                        blocks[blocks.length - 1] = gridMetadata[idx][yGrid];
                        isValid = true;
                    }
                }
                if (type !== 0 && isValid) {
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
                blocks,
                columns
            };
        })
    };
}

let globalGridMetadata = null;

async function getGridMetadata(entry) {
    if (!globalGridMetadata) {
        const metadataReq = await fetch('/metadata/grids.json');
        globalGridMetadata = await metadataReq.json();
    }
    return globalGridMetadata[entry];
}

function getBlockData(library, block) {
    if (!block)
        return null;

    const layout = library.layouts[block.layout];
    if (layout) {
        return layout.blocks[block.block];
    }
    return null;
}

const libraries = [];

export function loadLibrary(bkg, bricks, mask, palette, entry) {
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
        layouts.push(loadLayout(layoutDataView, i));
    }
    const mapping = loadBricksMapping(layouts, bricks, mask, palette);
    const library = {
        index: entry,
        texture: mapping.texture,
        bricksMap: mapping.bricksMap,
        layouts
    };
    libraries[entry] = library;
    return library;
}

function loadLayout(dataView, index) {
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
}
