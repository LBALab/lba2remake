export function checkVariantMatch(grid, xStart, yStart, zStart, variant, replacements) {
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
            const columnData = grid.cells[idxGrid];
            if (!columnData || !columnData.blocks) {
                return false;
            }
            const column = columnData.blocks;
            for (let y = 0; y < nY; y += 1) {
                const yGrid = yStart + y;
                const idxVariant = (nX - x - 1) + y * nX + (nZ - z - 1) * nX * nY;
                const brickVariant = blocksVariant[idxVariant];
                if (brickVariant === -1 || brickVariant === undefined) {
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
