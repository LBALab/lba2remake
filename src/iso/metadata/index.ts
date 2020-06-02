import { loadMetadata } from './metadata';
import {
    initReplacements,
    processLayoutReplacement,
    buildReplacementMeshes,
    addReplacementObject
} from './replacements';
import { processLayoutMirror, buildMirrors } from './mirrors';
import { saveFullSceneModel } from './models';
import { loadGrid } from '../grid';
import { loadImageData } from '..';
import { loadBricks } from '../bricks';
import { loadResource, ResourceType } from '../../resources';
import { processVariants, suppressVariantBricks } from './variants';

export async function extractGridMetadata(grid, entry, ambience, is3D) {
    if (!is3D) {
        return {
            replacements: { threeObject: null, mixer: null },
            mirrors: null
        };
    }
    const metadata = await loadMetadata(entry, grid.library);

    const replacements = await initReplacements(entry, metadata, ambience);
    const mirrorGroups = {};

    forEachCell(grid, metadata, (cellInfo) => {
        const { variants, replace, mirror } = cellInfo;
        const candidates = [];
        if (variants) {
            processVariants(grid, cellInfo, replacements, candidates);
        }
        if (replace) {
            processLayoutReplacement(grid, cellInfo, replacements, candidates);
        }
        processCandidates(replacements, cellInfo, candidates);
        if (mirror) {
            processLayoutMirror(cellInfo, mirrorGroups);
        }
    });

    return {
        replacements,
        mirrors: buildMirrors(mirrorGroups)
    };
}

export async function saveSceneReplacementModel(entry, ambience) {
    const [pal, bkg, mask] = await Promise.all([
        loadResource(ResourceType.PALETTE),
        loadResource(ResourceType.BRICKS),
        loadImageData('images/brick_mask.png')
    ]);
    const palette = pal.getBufferUint8();
    const bricks = loadBricks(bkg);
    const grid = loadGrid(bkg, bricks, mask, palette, entry + 1);

    const metadata = await loadMetadata(entry, grid.library, true);
    const replacements = await initReplacements(entry, metadata, ambience);

    forEachCell(grid, metadata, (cellInfo) => {
        const { variants, replace } = cellInfo;
        const candidates = [];
        if (variants) {
            processVariants(grid, cellInfo, replacements, candidates);
        }
        if (replace) {
            processLayoutReplacement(grid, cellInfo, replacements, candidates);
        }
        processCandidates(replacements, cellInfo, candidates);
    });

    buildReplacementMeshes(replacements);
    saveFullSceneModel(replacements, entry);
}

const volume = ({data}) => data.nX * data.nY * data.nZ;

function processCandidates(replacements, cellInfo, candidates) {
    if (candidates.length > 0) {
        candidates.sort((a, b) => volume(b) - volume(a));
        const candidate = candidates[0];
        const { x, y, z } = cellInfo.pos;
        const { nX, nZ } = candidate.data;
        const realY = (y * 0.5) + 0.5;
        const realZ = z - 1;
        suppressVariantBricks(replacements, candidate.data, cellInfo);
        if (replacements.mergeReplacements) {
            addReplacementObject(
                candidate.replacementData,
                replacements,
                x - (nX * 0.5) + 1,
                realY - 0.5,
                realZ - (nZ * 0.5) + 1
            );
        }
    }
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
