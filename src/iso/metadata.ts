import * as THREE from 'three';

const angleMapping = [
    Math.PI / 2.0,
    Math.PI,
    -Math.PI / 2.0,
    0,
];

const H = 0.5;

export function extractGridMetadata(grid, metadata) {
    const replacements = {
        objects: [],
        bricks: new Set()
    };
    let c = 0;
    for (let z = -1; z < 63; z += 1) {
        for (let x = 0; x < 64; x += 1) {
            const cell = grid.cells[c];
            const blocks = cell.blocks;
            for (let yIdx = 0; yIdx < blocks.length; yIdx += 1) {
                const y = (yIdx * H) + H;
                if (blocks[yIdx]) {
                    const layout = grid.library.layouts[blocks[yIdx].layout];
                    if (layout && layout.index in metadata) {
                        const lMetadata = metadata[layout.index];
                        if (lMetadata.replace) {
                            const {nX, nY, nZ} = layout;
                            const idx = blocks[yIdx].block;
                            const zb = Math.floor(idx / (nY * nX));
                            const yb = Math.floor(idx / nX) - (zb * nY);
                            const xb = idx % nX;
                            // Check brick at the bottom corner of layout
                            if (yb === 0 && xb === nX - 1 && zb === nZ - 1) {
                                if (checkMatch(grid, layout, x, yIdx, z)) {
                                    suppressBricks(replacements, layout, x, yIdx, z);
                                    addReplacementObject(
                                        replacements,
                                        lMetadata,
                                        x - (nX * 0.5) + 1, y - H, z - (nZ * 0.5) + 1
                                    );
                                } else {
                                    // Log when missing match
                                    // console.log(replacement.file, xb, yb, zb);
                                }
                            }
                        }
                    }
                }
            }
            c += 1;
        }
    }
    return {replacements};
}

function checkMatch(grid, layout, x, y, z) {
    const {nX, nY, nZ} = layout;
    for (let zL = 0; zL < nZ; zL += 1) {
        for (let yL = 0; yL < nY; yL += 1) {
            for (let xL = 0; xL < nX; xL += 1) {
                const zT = z - zL;
                const yT = y + yL;
                const xT = x - xL;
                const c = (zT + 1) * 64 + xT;
                const cell = grid.cells[c];
                const blocks = cell.blocks;
                if (!blocks[yT]) {
                    continue;
                }
                const layout2 = grid.library.layouts[blocks[yT].layout];
                if (!layout2 || layout2.index !== layout.index) {
                    return false;
                }
            }
        }
    }
    return true;
}

function suppressBricks(gridReps, layout, x, y, z) {
    const {nX, nY, nZ} = layout;
    for (let zL = 0; zL < nZ; zL += 1) {
        for (let yL = 0; yL < nY; yL += 1) {
            for (let xL = 0; xL < nX; xL += 1) {
                const zT = z - zL;
                const yT = y + yL;
                const xT = x - xL;
                gridReps.bricks.add(`${xT},${yT},${zT}`);
            }
        }
    }
}

function addReplacementObject(gridReps, metadata, x, y, z) {
    const threeObject = metadata.threeObject.clone();
    const scale = 1 / 0.75;
    threeObject.position.set(x, y, z);
    threeObject.scale.set(scale, scale, scale);
    const orientation = metadata.orientation;
    const angle = angleMapping[orientation];
    threeObject.quaternion.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        angle
    );
    gridReps.objects.push(threeObject);
}
