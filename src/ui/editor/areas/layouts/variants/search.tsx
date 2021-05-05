import {
    map,
    filter,
    times,
    flatten,
    find,
    reduce,
    each,
    uniqBy,
    mapValues,
    groupBy,
    uniq
} from 'lodash';

import { bits } from '../../../../../utils';
import { getBricksHQR, getSceneMap } from '../../../../../resources';
import { loadLayout } from '../../../../../game/scenery/isometric/layouts';
import { getParams } from '../../../../../params';

export async function findAllVariants(lDef) {
    const { nX, nY, nZ } = lDef.props;
    if (nX === 1 && nY === 1 && nZ === 1) {
        return [];
    }
    const bkg = await getBricksHQR();
    const layout = loadLayout(bkg, lDef);
    let variantsByScenes: any[];
    if (getParams().game === 'lba1') {
        variantsByScenes = [
            await findAllVariantsInScene(bkg, lDef, layout, {
                sceneryIndex: lDef.library
            })
        ];
    } else {
        const sceneList = times(222);
        const sceneMap = await getSceneMap();
        variantsByScenes = await Promise.all(
            map(sceneList, async (scene) => {
                const indexInfo = sceneMap[scene];
                if (indexInfo.isIsland) {
                    return [];
                }
                return findAllVariantsInScene(
                    bkg,
                    lDef,
                    layout,
                    indexInfo
                );
            })
        );
    }
    const allVariants = flatten(variantsByScenes);
    const scenesByKey = mapValues(
        groupBy(allVariants, 'key'),
        v => uniq(map(v, 'scene.sceneryIndex'))
    );
    const variants = filter(
        uniqBy(allVariants, 'key'),
        v => !matchesDefaultLayout(v, lDef.props)
    );
    return map(variants, (v, idx) => ({
        id: idx + 1,
        key: v.key,
        nX: v.nX,
        nY: v.nY,
        nZ: v.nZ,
        blocks: v.blocks,
        library: lDef.library,
        layout: lDef.layout,
        scenes: scenesByKey[v.key]
    }));
}

async function findAllVariantsInScene(bkg, lDef, layout, indexInfo) {
    const isoScenery = await loadIsometricSceneryForSearch(
        bkg,
        lDef.library,
        indexInfo.sceneryIndex,
        layout
    );
    if (!isoScenery) {
        return [];
    }

    let c = 0;
    const variants = [];
    for (let z = 0; z < 64; z += 1) {
        for (let x = 0; x < 64; x += 1) {
            const blocks = isoScenery[c];
            for (let y = 0; y < blocks.length; y += 1) {
                if (blocks[y] !== -1) {
                    const block = lDef.props.blocks[blocks[y]];
                    const brick = block && block.brick;
                    const cell = {x, y, z, brick};
                    const variant = find(
                        variants,
                        v => find(
                            v,
                            ({x: ix, y: iy, z: iz}) =>
                                Math.abs(x - ix) <= 1
                                && Math.abs(y - iy) <= 1
                                && Math.abs(z - iz) <= 1
                        )
                    );
                    if (variant) {
                        variant.push(cell);
                    } else {
                        variants.push([cell]);
                    }
                }
            }
            c += 1;
        }
    }
    mergeTouchingVariants(variants);
    const getRange = (variant, prop) => reduce(variant, (r, cell) => {
        return {
            min: Math.min(cell[prop], r.min),
            max: Math.max(cell[prop], r.max),
        };
    }, {
        min: Infinity,
        max: -Infinity
    });
    const dim = r => (r.max - r.min) + 1;
    return map(variants, (variant) => {
        const xRange = getRange(variant, 'x');
        const yRange = getRange(variant, 'y');
        const zRange = getRange(variant, 'z');
        const nX = dim(xRange);
        const nY = dim(yRange);
        const nZ = dim(zRange);
        const blocks = [];
        each(variant, (cell) => {
            const x = cell.x - xRange.min;
            const y = cell.y - yRange.min;
            const z = cell.z - zRange.min;
            const idx = x + y * nX + z * nX * nY;
            blocks[idx] = { brick: cell.brick };
        });
        return {
            nX,
            nY,
            nZ,
            key: `${nX}x${nY}x${nZ}:${map(blocks, b => b ? b.brick : -1).join(',')}`,
            blocks,
            scene: indexInfo
        };
    });
}

function mergeTouchingVariants(variants) {
    for (let i = 0; i < variants.length; i += 1) {
        const variant = variants[i];
        const mergeWith = [];
        for (let j = 0; j < variants.length; j += 1) {
            if (j === i) {
                continue;
            }
            let needsMerge = true;
            const otherVariant = variants[j];
            for (let k = 0; k < variant.length; k += 1) {
                const {x, y, z} = variant[k];
                const match = find(
                    otherVariant,
                    ({x: ix, y: iy, z: iz}) =>
                        Math.abs(x - ix) <= 1
                        && Math.abs(y - iy) <= 1
                        && Math.abs(z - iz) <= 1
                );
                if (!match) {
                    needsMerge = false;
                    break;
                }
            }
            if (needsMerge) {
                mergeWith.push(j);
            }
        }
        each(mergeWith, (tgt) => {
            variants[tgt].push.apply(variants[tgt], variant);
        });
        if (mergeWith.length > 0) {
            variants.splice(i, 1);
            i -= 1;
        }
    }
}

async function loadIsometricSceneryForSearch(bkg, libraryIdx, entry, tgtLayout) {
    const gridData = new DataView(bkg.getEntry(entry + 1));
    const libIndex = gridData.getUint8(0);
    if (libIndex === libraryIdx) {
        const maxOffset = 34 + (4096 * 2);
        const offsets = [];
        for (let i = 34; i < maxOffset; i += 2) {
            offsets.push(gridData.getUint16(i, true) + 34);
        }
        return map(offsets, (offset) => {
            const blocks = [];
            const numColumns = gridData.getUint8(offset);
            offset += 1;
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
                            blocks.push(-1);
                            break;
                        case 1: {
                            const layout = gridData.getUint8(offset) - 1;
                            if (layout === tgtLayout.index) {
                                blocks.push(gridData.getUint8(offset + 1));
                            } else {
                                blocks.push(-1);
                            }

                            offset += 2;
                            break;
                        }
                        case 2:
                            if (block && block.layout === tgtLayout.index) {
                                blocks.push(block.block);
                            } else {
                                blocks.push(-1);
                            }
                            break;
                        case 3:
                            throw new Error('Unsupported block type');
                    }
                }
            }
            return blocks;
        });
    }
    return null;
}

function matchesDefaultLayout(variant, layout) {
    const {nX, nY, nZ} = layout;
    if (nX !== variant.nX || nY !== variant.nY || nZ !== variant.nZ) {
        return false;
    }
    let c = 0;
    for (let z = 0; z < nZ; z += 1) {
        for (let y = 0; y < nY; y += 1) {
            for (let x = 0; x < nX; x += 1, c += 1) {
                if (!variant.blocks[c]) {
                    continue;
                }
                if (variant.blocks[c].brick !== layout.blocks[c].brick) {
                    return false;
                }
            }
        }
    }
    return true;
}
