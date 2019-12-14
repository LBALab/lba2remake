import * as THREE from 'three';
import { find, each } from 'lodash';
import { loadLUTTexture } from '../utils/lut';
import { loadPaletteTexture } from '../texture';
import VERT_OBJECTS_COLORED from './shaders/objects/colored.vert.glsl';
import FRAG_OBJECTS_COLORED from './shaders/objects/colored.frag.glsl';
import VERT_OBJECTS_TEXTURED from './shaders/objects/textured.vert.glsl';
import FRAG_OBJECTS_TEXTURED from './shaders/objects/textured.frag.glsl';
import { loadHqr } from '../hqr';
import { compile } from '../utils/shaders';

const angleMapping = [
    Math.PI / 2.0,
    Math.PI,
    -Math.PI / 2.0,
    0,
];

const H = 0.5;

export async function extractGridMetadata(grid, metadata, ambience) {
    const replacements = {
        objects: [],
        bricks: new Set()
    };
    const mirrorGroups = {};
    let c = 0;
    const [lutTexture, ress] = await Promise.all([
        await loadLUTTexture(),
        await loadHqr('RESS.HQR')
    ]);
    const palette = new Uint8Array(ress.getEntry(0));
    const paletteTexture = loadPaletteTexture(palette);
    const light = getLightVector(ambience);
    const shaderData = {
        light,
        lutTexture,
        paletteTexture
    };
    for (let z = 0; z < 64; z += 1) {
        for (let x = 0; x < 64; x += 1) {
            const cell = grid.cells[c];
            const blocks = cell.blocks;
            for (let y = 0; y < blocks.length; y += 1) {
                const yPos = (y * H) + H;
                const zPos = z - 1;
                if (blocks[y]) {
                    const layout = grid.library.layouts[blocks[y].layout];
                    if (layout && layout.index in metadata) {
                        const lMetadata = metadata[layout.index];
                        if (lMetadata.replace) {
                            const {nX, nY, nZ} = layout;
                            const idx = blocks[y].block;
                            const zb = Math.floor(idx / (nY * nX));
                            const yb = Math.floor(idx / nX) - (zb * nY);
                            const xb = idx % nX;
                            // Check brick at the bottom corner of layout
                            if (yb === 0 && xb === nX - 1 && zb === nZ - 1) {
                                if (checkMatch(grid, layout, x, y, zPos)) {
                                    suppressBricks(replacements, layout, x, y, z);
                                    addReplacementObject(
                                        replacements,
                                        lMetadata,
                                        x - (nX * 0.5) + 1, yPos - H, zPos - (nZ * 0.5) + 1,
                                        shaderData
                                    );
                                } else {
                                    // Log when missing match
                                    // console.log(replacement.file, xb, yb, zb);
                                }
                            }
                        }
                        if (lMetadata.mirror) {
                            let groups = mirrorGroups[layout.index];
                            if (!groups) {
                                groups = [];
                                mirrorGroups[layout.index] = groups;
                            }
                            const fg = find(groups, (g) => {
                                for (let dz = -1; dz <= 0; dz += 1) {
                                    for (let dx = -1; dx <= 0; dx += 1) {
                                        for (let dy = -1; dy <= 0; dy += 1) {
                                            if (!(dz === 0 && dx === 0 && dy === 0)) {
                                                const key = `${x + dx},${y + dy},${z + dz}`;
                                                if (g.cells.has(key)) {
                                                    return true;
                                                }
                                            }
                                        }
                                    }
                                }
                                return false;
                            });
                            if (fg) {
                                fg.cells.add(`${x},${y},${z}`);
                                fg.max.x = Math.max(fg.max.x, x);
                                fg.max.y = Math.max(fg.max.y, y);
                                fg.max.z = Math.max(fg.max.z, z);
                            } else {
                                const cells = new Set();
                                cells.add(`${x},${y},${z}`);
                                groups.push({
                                    cells,
                                    min: {x, y, z},
                                    max: {x, y, z}
                                });
                            }
                        }
                    }
                }
            }
            c += 1;
        }
    }
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
    return {
        replacements,
        mirrors
    };
}

export async function replaceMaterials(threeObject, shaderData, angle) {
    const {lutTexture, paletteTexture, light} = shaderData;
    threeObject.traverse((node) => {
        if (node instanceof THREE.Mesh) {
            const rotation = new THREE.Matrix4().makeRotationY(angle - Math.PI / 2);
            node.updateMatrixWorld();
            rotation.multiply(node.matrixWorld);
            const normalMatrix = new THREE.Matrix3();
            normalMatrix.setFromMatrix4(rotation);
            const material = node.material as THREE.MeshStandardMaterial;
            if (material.map) {
                node.material = new THREE.RawShaderMaterial({
                    vertexShader: compile('vert', VERT_OBJECTS_TEXTURED),
                    fragmentShader: compile('frag', FRAG_OBJECTS_TEXTURED),
                    uniforms: {
                        uNormalMatrix: {value: normalMatrix},
                        uTexture: {value: material.map},
                        lutTexture: {value: lutTexture},
                        palette: {value: paletteTexture},
                        light: {value: light}
                    }
                });
            } else {
                const mColor = material.color.clone().convertLinearToGamma();
                const color = new THREE.Vector3().fromArray(mColor.toArray());
                node.material = new THREE.RawShaderMaterial({
                    vertexShader: compile('vert', VERT_OBJECTS_COLORED),
                    fragmentShader: compile('frag', FRAG_OBJECTS_COLORED),
                    uniforms: {
                        uNormalMatrix: {value: normalMatrix},
                        uColor: {value: color},
                        lutTexture: {value: lutTexture},
                        palette: {value: paletteTexture},
                        light: {value: light}
                    }
                });
            }
        }
    });
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

async function addReplacementObject(gridReps, metadata, x, y, z, shaderData) {
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
    replaceMaterials(threeObject, shaderData, angle);
    gridReps.objects.push(threeObject);
}

function getLightVector(ambience) {
    const lightVector = new THREE.Vector3(-1, 0, 0);
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 0, 1),
        -(ambience.lightingAlpha * 2 * Math.PI) / 0x1000
    );
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -(ambience.lightingBeta * 2 * Math.PI) / 0x1000
    );
    return lightVector;
}
