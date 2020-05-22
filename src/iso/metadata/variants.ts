import { addReplacementObject } from './replacements';

export function processVariants(grid, cellInfo, replacements) {
    const {
        variants,
        pos: { x, y, z }
    } = cellInfo;

    for (let i = 0; i < variants.length; i += 1) {
        const variant = variants[i];
        if (checkVariantMatch(grid, cellInfo, variant.props)) {
            // console.log('matched', variant, 'at', x, y, z);
            suppressVariantBricks(replacements, variant.props, cellInfo);
            if (replacements.mergeReplacements) {
                const realY = (y * 0.5) + 0.5;
                const realZ = z - 1;
                addReplacementObject(
                    variant,
                    replacements,
                    x - (variant.props.nX * 0.5) + 1,
                    realY - 0.5,
                    realZ - (variant.props.nZ * 0.5) + 1
                );
            }
        }
    }
}

function checkVariantMatch(grid, cellInfo, variant) {
    const {
        x: xStart,
        y: yStart,
        z: zStart
    } = cellInfo.pos;
    const {
        nX,
        nY,
        nZ,
        blocks: blocksVariant,
        layout
    } = variant;
    for (let z = 0; z < nZ; z += 1) {
        const zGrid = zStart - z;
        for (let x = 0; x < nX; x += 1) {
            const xGrid = xStart - x;
            const idxGrid = zGrid * 64 + xGrid;
            const column = grid.cells[idxGrid].blocks;
            for (let y = 0; y < nY; y += 1) {
                const yGrid = yStart + y;
                const idxVariant = (nX - x - 1) + y * nX + (nZ - z - 1) * nX * nY;
                const brickVariant = blocksVariant[idxVariant];
                if (brickVariant === -1) {
                    continue;
                }
                if (!column[yGrid]) {
                    return false;
                }
                const gridLayoutInfo = grid.library.layouts[column[yGrid].layout];
                if (!gridLayoutInfo || gridLayoutInfo.index !== layout) {
                    return false;
                }
                const brick = gridLayoutInfo.blocks[column[yGrid].block].brick;
                if (brick !== brickVariant) {
                    return false;
                }
            }
        }
    }
    return true;
}

function suppressVariantBricks(replacements, variant, cellInfo) {
    const {
        x: xStart,
        y: yStart,
        z: zStart
    } = cellInfo.pos;
    const { nX, nY, nZ } = variant;
    for (let z = 0; z < nZ; z += 1) {
        const zGrid = zStart - z;
        for (let y = 0; y < nY; y += 1) {
            const yGrid = yStart + y;
            for (let x = 0; x < nX; x += 1) {
                const xGrid = xStart - x;
                replacements.bricks.add(`${xGrid},${yGrid},${zGrid}`);
            }
        }
    }
}
