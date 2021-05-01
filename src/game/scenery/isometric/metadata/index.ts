import { loadLayoutsMetadata } from './layouts';
import {
    initReplacements,
    applyReplacement,
    buildReplacementMeshes,
} from './replacements';
import { processLayoutMirror, buildMirrors } from './mirrors';
import { saveFullSceneModel } from './models';
import { getGridMetadata } from '../grid';
import { getPalette, getGrid, getBricks } from '../../../../resources';
import { checkVariantMatch } from './matchers/variants';
import { loadBrickMask } from '../mask';

export async function extractBricksReplacementInfo(
    grid,
    entry,
    ambience,
    is3D,
    isEditor,
    numActors
) {
    if (!is3D) {
        return {
            replacements: { threeObject: null, update: null },
            mirrors: null
        };
    }
    const layoutsMetadata = await loadLayoutsMetadata(entry, grid.library, isEditor);

    const replacements = await initReplacements(
        entry,
        layoutsMetadata,
        ambience,
        isEditor,
        numActors
    );
    const mirrorGroups = {};

    computeReplacements({
        grid,
        layoutsMetadata,
        replacements,
        mirrorGroups,
        apply: true
    });

    return {
        replacements,
        mirrors: buildMirrors(mirrorGroups)
    };
}

export async function saveSceneReplacementModel(entry, ambience) {
    const [palette, bricks, gridMetadata, mask] = await Promise.all([
        getPalette(),
        getBricks(),
        getGridMetadata(entry),
        loadBrickMask()
    ]);

    const grid = await getGrid(entry, {
        bricks,
        mask,
        palette,
        is3D: true,
        gridMetadata,
        noCache: true
    });

    const layoutsMetadata = await loadLayoutsMetadata(entry, grid.library, true, true);
    const replacements = await initReplacements(entry, layoutsMetadata, ambience, true, 0);

    computeReplacements({grid, layoutsMetadata, replacements});
    buildReplacementMeshes(replacements);
    await saveFullSceneModel(replacements, entry);
}

function computeReplacements({
    grid,
    layoutsMetadata,
    replacements,
    mirrorGroups = null,
    apply = false
}) {
    for (const variant of layoutsMetadata.variants) {
        forEachCell(grid, layoutsMetadata, (_layoutInfo, layout, x, y, z) => {
            checkVariant(grid, x, y, z, replacements, variant, layout);
        });
    }
    forEachCell(grid, layoutsMetadata, (layoutInfo, layout, x, y, z) => {
        const { mirror, suppress } = layoutInfo;

        if (apply) {
            if (mirror) {
                processLayoutMirror(layout.index, x, y, z, mirrorGroups);
            }
            if (suppress) {
                replacements.bricks.add(`${x},${y},${z}`);
            }
        }
    });
}

function checkVariant(grid, xStart, yStart, zStart, replacements, variant, layout) {
    if (checkVariantMatch(grid, xStart, yStart, zStart, variant.props, replacements)) {
        applyReplacement(xStart, yStart, zStart, replacements, {
            type: 'variant',
            data: variant.props,
            replacementData: {
                layout,
                ...variant
            }
        });
    }
}

function forEachCell(grid, metadata, handler) {
    let c = 0;
    const { layouts } = grid.library;
    const mdLayouts = metadata.layouts;
    for (let z = 0; z < 64; z += 1) {
        for (let x = 0; x < 64; x += 1) {
            const cell = grid.cells[c];
            const blocks = cell.blocks;
            for (let y = 0; y < blocks.length; y += 1) {
                const bly = blocks[y];
                if (bly) {
                    const layout = layouts[bly.layout];
                    if (layout && layout.index in mdLayouts) {
                        handler(mdLayouts[layout.index], layout, x, y, z);
                    }
                }
            }
            c += 1;
        }
    }
}
