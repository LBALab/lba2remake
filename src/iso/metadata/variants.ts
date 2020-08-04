export function processVariants(grid, cellInfo, replacements, candidates) {
    const { variants } = cellInfo;

    for (let i = 0; i < variants.length; i += 1) {
        const variant = variants[i];
        if (checkVariantMatch(grid, cellInfo, variant.props, replacements)) {
            // suppressVariantBricks(replacements, variant.props, cellInfo);
            candidates.push({
                type: 'variant',
                data: variant.props,
                replacementData: {
                    ...variant,
                    parent: cellInfo
                }
            });
        }
    }
}

function checkVariantMatch(grid, cellInfo, variant, replacements) {
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
                if (replacements.bricks.has(`${xGrid},${yGrid},${zGrid}`)) {
                    return false;
                }
                if (!column[yGrid]) {
                    return false;
                }
                if (column[yGrid].layout !== layout) {
                    return false;
                }
                const gridLayoutInfo = grid.library.layouts[column[yGrid].layout];
                const brick = gridLayoutInfo.blocks[column[yGrid].block].brick;
                if (brick !== brickVariant) {
                    return false;
                }
            }
        }
    }
    return true;
}

export function suppressVariantBricks(replacements, variant, cellInfo) {
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
