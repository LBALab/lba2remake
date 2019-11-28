import * as THREE from 'three';

const angleMapping = [
    Math.PI / 2.0,
    Math.PI,
    -Math.PI / 2.0,
    0,
];

const H = 0.5;

export function extractGridReplacements(grid, replacements) {
    const gridReps = {
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
                    if (layout && layout.index in replacements
                        && layout.nX === 1 && layout.nZ === 1) {
                        const replacement = replacements[layout.index];
                        const threeObject = replacement.threeObject.clone();
                        const scale = 1 / 0.75;
                        threeObject.position.set(x + 0.5, y - H, z + 0.5);
                        threeObject.scale.set(scale, scale, scale);
                        const orientation = replacement.orientation;
                        const angle = angleMapping[orientation];
                        threeObject.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
                        while (yIdx < blocks.length) {
                            if (!blocks[yIdx]) {
                                yIdx -= 1;
                                break;
                            }
                            const layout2 = grid.library.layouts[blocks[yIdx].layout];
                            if (!layout2 || layout2.index !== layout.index) {
                                yIdx -= 1;
                                break;
                            }
                            gridReps.bricks.add(`${x},${yIdx},${z}`);
                            yIdx += 1;
                        }
                        gridReps.objects.push(threeObject);
                    }
                }
            }
            c += 1;
        }
    }
    return gridReps;
}
