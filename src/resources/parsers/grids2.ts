import * as THREE from 'three';
import { map, last } from 'lodash';

import { bits } from '../../utils';
import { loadLibrary } from '../../game/scenery/isometric/grid';
import { Resource } from '../load';

export const parseGridLBA2 = async (resource: Resource, index: number, param: any) => {
    // this dependency shouldn't be here
    const { bricks, mask, palette, is3D, gridMetadata } = param;
    const gridData = new DataView(resource.getEntry(index + 1)); // scene index plus 1
    const libIndex = gridData.getUint8(0);
    const library = await loadLibrary(bricks, mask, palette, libIndex);
    const maxOffset = 34 + (4096 * 2);
    const offsets = [];
    for (let i = 34; i < maxOffset; i += 2) {
        offsets.push(gridData.getUint16(i, true) + 34);
    }
    const cells = getCells(gridData, offsets, library, is3D, gridMetadata);
    return {
        library,
        cells,
    };
};

export const getCells = (
    gridData: DataView,
    offsets: number[],
    library: any,
    is3D: boolean,
    gridMetadata: any
) => {
    return map(offsets, (offset, idx) => {
        const blocks = [];
        const numColumns = gridData.getUint8(offset);
        offset += 1;
        const columns = [];
        const x = idx % 64;
        const z = Math.floor(idx / 64);
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
            let hasReplacement = false;

            for (let j = 0; j < height; j += 1) {
                const yGrid = baseHeight + j;
                switch (type) {
                    case 0:
                        blocks.push(null);
                        break;
                    case 1: {
                        const layout = gridData.getUint8(offset) - 1;
                        const blockIdx = gridData.getUint8(offset + 1);
                        if (layout !== -1 && blockIdx !== -1) {
                            isValid = true;
                        }
                        blocks.push({
                            layout,
                            block: blockIdx,
                        });

                        offset += 2;
                        break;
                    }
                    case 2:
                        if (block.layout !== -1 && block.block !== -1) {
                            isValid = true;
                        }
                        blocks.push(block);
                        break;
                    case 3:
                        throw new Error('Unsupported block type');
                }
                const key = `${x}x${yGrid}x${z}`;
                if (is3D && gridMetadata && key in gridMetadata.patches) {
                    const replacementBlock = gridMetadata.patches[key];
                    if ('layout' in replacementBlock
                        && replacementBlock.layout !== -1) {
                        blocks[blocks.length - 1] = replacementBlock;
                    }
                    if (replacementBlock.hide && blocks[blocks.length - 1]) {
                        blocks[blocks.length - 1].hide = true;
                    }
                    isValid = replacementBlock.layout !== -1;
                    hasReplacement = hasReplacement || isValid;
                }
            }
            if ((type !== 0 || hasReplacement) && isValid) {
                const blockData = getBlockData(library, blocks);
                columns.push({
                    shape: (blockData && blockData.shape) || 1,
                    box: new THREE.Box3(
                        new THREE.Vector3(
                            (64 - z) / 32,
                            baseHeight / 64,
                            x / 32
                        ),
                        new THREE.Vector3(
                            (65 - z) / 32,
                            (baseHeight + height) / 64,
                            (x + 1) / 32
                        )
                    ),
                    groundType: (blockData && blockData.groundType),
                    sound: (blockData && blockData.sound) || -1,
                    sound2: (blockData && blockData.sound2) || null
                });
            }
            baseHeight += height;
        }
        for (let i = 0; i < blocks.length; i += 1) {
            if (blocks[i] && (blocks[i].layout === -1 || blocks[i].block === -1)) {
                blocks[i] = null;
            }
        }
        return {
            blocks,
            columns
        };
    });
};

export const getBlockData = (library, blocks: any[]) => {
    const block = last(blocks);
    if (!block)
        return null;

    if (block.layout === -1) {
        let prevBlock = null;
        for (let i = blocks.length - 2; i >= 0; i += 1) {
            if (blocks[i] && blocks[i].layout !== -1) {
                const prevLayout = library.layouts[blocks[i].layout];
                if (prevLayout) {
                    prevBlock = prevLayout.blocks[blocks[i].block];
                    break;
                }
            }
        }
        return {
            shape: block.block,
            groundType: (prevBlock && prevBlock.groundType),
            sound: (prevBlock && prevBlock.sound) || -1,
            sound2: (prevBlock && prevBlock.sound2) || null
        };
    }

    const layout = library.layouts[block.layout];
    if (layout) {
        return layout.blocks[block.block];
    }
    return null;
};
