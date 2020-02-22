import { each } from 'lodash';
import { loadMetadata } from './metadata';
import {
    initReplacements,
    processLayoutReplacement,
    buildReplacementMeshes
} from './replacements';
import { processLayoutMirror } from './mirrors';
import { saveFullSceneModel } from './models';

export async function extractGridMetadata(grid, entry, ambience, is3D) {
    if (!is3D) {
        return {
            replacements: { threeObject: null },
            mirrors: null
        };
    }
    const metadata = await loadMetadata(entry, grid.library);

    const replacements = await initReplacements(entry, metadata, ambience);
    const mirrorGroups = {};

    forEachCell(grid, metadata, (cellInfo) => {
        if (cellInfo.replace) {
            processLayoutReplacement(grid, cellInfo, replacements);
        }
        if (cellInfo.mirror) {
            processLayoutMirror(cellInfo, mirrorGroups);
        }
    });
    const mirrors = new Map<string, number[][]>();
    each(mirrorGroups, (groups) => {
        each(groups, (g: any) => {
            for (let x = g.min.x; x <= g.max.x; x += 1) {
                for (let y = g.min.y; y <= g.max.y; y += 1) {
                    for (let z = g.min.z; z <= g.max.z; z += 1) {
                        if (x === g.min.x || y === g.min.y || z === g.min.z) {
                            const sides = [];
                            if (x === g.min.x) {
                                sides[0] = [g.max.x, y, z];
                            }
                            if (y === g.min.y) {
                                sides[1] = [x, g.max.y, z];
                            }
                            if (z === g.min.z) {
                                sides[2] = [x, y, g.max.z];
                            }
                            mirrors[`${x},${y},${z}`] = sides;
                        }
                    }
                }
            }
        });
    });

    if (!replacements.threeObject) {
        replacements.threeObject = buildReplacementMeshes(entry, replacements);
        saveFullSceneModel(replacements.threeObject, entry);
    }

    return {
        replacements,
        mirrors
    };
}

function forEachCell(grid, metadata, handler) {
    let c = 0;
    for (let z = 0; z < 64; z += 1) {
        for (let x = 0; x < 64; x += 1) {
            const cell = grid.cells[c];
            const blocks = cell.blocks;
            for (let y = 0; y < blocks.length; y += 1) {
                if (blocks[y]) {
                    const layout = grid.library.layouts[blocks[y].layout];
                    if (layout && layout.index in metadata.layouts) {
                        handler({
                            ...metadata.layouts[layout.index],
                            layout,
                            pos: {x, y, z},
                            blocks
                        });
                    }
                }
            }
            c += 1;
        }
    }
}
