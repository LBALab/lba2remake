import * as THREE from 'three';
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
    const mirrors = new Set();
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
                                        x - (nX * 0.5) + 1, y - H, z - (nZ * 0.5) + 1,
                                        shaderData
                                    );
                                } else {
                                    // Log when missing match
                                    // console.log(replacement.file, xb, yb, zb);
                                }
                            }
                        }
                        if (lMetadata.mirror) {
                            mirrors.add(`${x},${yIdx},${z}`);
                        }
                    }
                }
            }
            c += 1;
        }
    }
    return {
        replacements,
        mirrors
    };
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
