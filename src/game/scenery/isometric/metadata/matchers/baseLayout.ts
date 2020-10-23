export function checkBaseLayoutMatch(grid, cellInfo, replacements) {
    const {
        layout: {
            blocks,
            index: layout,
            nX,
            nY,
            nZ
        },
        pos: {
            x: xStart,
            y: yStart,
            z: zStart
        }
    } = cellInfo;
    for (let z = 0; z < nZ; z += 1) {
        const zGrid = zStart - z;
        for (let x = 0; x < nX; x += 1) {
            const xGrid = xStart - x;
            const idxGrid = zGrid * 64 + xGrid;
            const column = grid.cells[idxGrid].blocks;
            for (let y = 0; y < nY; y += 1) {
                const yGrid = yStart + y;
                if (replacements.bricks.has(`${xGrid},${yGrid},${zGrid}`)) {
                    return false;
                }
                if (!column[yGrid]) {
                    if (cellInfo.variants) {
                        return false;
                    }
                    continue;
                }
                if (column[yGrid].layout !== layout) {
                    const gridLayoutInfo = grid.library.layouts[column[yGrid].layout];
                    if (gridLayoutInfo) {
                        const brick = gridLayoutInfo.blocks[column[yGrid].block].brick;
                        const idx = (nX - x - 1) + y * nX + (nZ - z - 1) * nX * nY;
                        const brickLayout = blocks[idx].brick;
                        if (brick !== brickLayout) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}
