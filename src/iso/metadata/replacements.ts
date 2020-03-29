import * as THREE from 'three';
import { each } from 'lodash';
import XXH from 'xxhashjs';

import { loadLUTTexture } from '../../utils/lut';
import { loadPaletteTexture } from '../../texture';
import VERT_OBJECTS_COLORED from '../shaders/objects/colored.vert.glsl';
import FRAG_OBJECTS_COLORED from '../shaders/objects/colored.frag.glsl';
import VERT_OBJECTS_TEXTURED from '../shaders/objects/textured.vert.glsl';
import FRAG_OBJECTS_TEXTURED from '../shaders/objects/textured.frag.glsl';
import { compile } from '../../utils/shaders';
import { loadFullSceneModel } from './models';
import { getResource } from '../../resources';

export async function initReplacements(entry, metadata, ambience) {
    const data = await loadReplacementData(ambience);
    if (metadata.hasFullReplacement) {
        return {
            threeObject: await loadFullSceneModel(entry, data),
            bricks: new Set()
        };
    }
    return {
        threeObject: null,
        geometries: {
            colored: {
                index: [],
                positions: [],
                normals: [],
                colors: [],
                uvs: null,
                material: new THREE.RawShaderMaterial({
                    vertexShader: compile('vert', VERT_OBJECTS_COLORED),
                    fragmentShader: compile('frag', FRAG_OBJECTS_COLORED),
                    uniforms: {
                        lutTexture: {value: data.lutTexture},
                        palette: {value: data.paletteTexture},
                        light: {value: data.light}
                    }
                })
            }
        },
        data,
        bricks: new Set()
    };
}

export function processLayoutReplacement(grid, cellInfo, replacements) {
    const {x, y, z} = cellInfo.pos;
    const {nX, nY, nZ} = cellInfo.layout;
    const realY = (y * 0.5) + 0.5;
    const realZ = z - 1;
    const idx = cellInfo.blocks[y].block;
    const zb = Math.floor(idx / (nY * nX));
    const yb = Math.floor(idx / nX) - (zb * nY);
    const xb = idx % nX;
    // Check brick at the bottom corner of layout
    if (yb === 0 && xb === nX - 1 && zb === nZ - 1) {
        if (checkMatch(grid, cellInfo.layout, x, y, realZ)) {
            suppressBricks(replacements, cellInfo.layout, x, y, z);
            if (!replacements.threeObject) {
                addReplacementObject(
                    cellInfo,
                    replacements,
                    replacements.data,
                    x - (nX * 0.5) + 1, realY - 0.5, realZ - (nZ * 0.5) + 1
                );
            }
        } else {
            // Log when missing match
            // console.log(replacement.file, xb, yb, zb);
        }
    }
}

export function buildReplacementMeshes(entry, replacements) {
    const threeObject = new THREE.Object3D();
    threeObject.name = `replacements_${entry}`;
    each(replacements.geometries, (geom, key) => {
        if (geom.positions.length > 0) {
            const bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.setIndex(new THREE.BufferAttribute(
                new Uint32Array(geom.index), 1
            ));
            bufferGeometry.setAttribute(
                'position',
                new THREE.BufferAttribute(new Float32Array(geom.positions), 3)
            );
            bufferGeometry.setAttribute(
                'normal',
                new THREE.BufferAttribute(new Float32Array(geom.normals), 3)
            );
            if (key.substring(0, 9) === 'textured_') {
                bufferGeometry.setAttribute(
                    'uv',
                    new THREE.BufferAttribute(new Float32Array(geom.uvs), 2)
                );
            } else {
                bufferGeometry.setAttribute(
                    'color',
                    new THREE.BufferAttribute(new Uint8Array(geom.colors), 3, true)
                );
            }
            const mesh = new THREE.Mesh(bufferGeometry, geom.material);
            mesh.name = key;
            threeObject.add(mesh);
        }
    });
    return threeObject;
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

const angleMapping = [
    Math.PI / 2.0,
    Math.PI,
    -Math.PI / 2.0,
    0,
];

async function addReplacementObject(cellInfo, replacements, replacementData, gx, gy, gz) {
    const threeObject = cellInfo.threeObject;
    const scale = 1 / 0.75;
    const orientation = cellInfo.orientation;
    const angle = angleMapping[orientation];
    const gTransform = new THREE.Matrix4();
    gTransform.compose(
        new THREE.Vector3(gx, gy, gz),
        new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            angle
        ),
        new THREE.Vector3(scale, scale, scale)
    );

    const POS = new THREE.Vector3();
    const NORM = new THREE.Vector3();

    threeObject.traverse((node) => {
        node.updateMatrix();
        node.updateMatrixWorld(true);
        if (node instanceof THREE.Mesh) {
            const transform = gTransform.clone();
            transform.multiply(node.matrixWorld);

            const geom = node.geometry as THREE.BufferGeometry;
            const pos_attr = geom.attributes.position;
            const normal_attr = geom.attributes.normal;
            const uv_attr = geom.attributes.uv;
            const index_attr = geom.index;

            const rotation = new THREE.Matrix4().makeRotationY(angle - Math.PI / 2);
            rotation.multiply(node.matrixWorld);
            const normalMatrix = new THREE.Matrix3();
            normalMatrix.setFromMatrix4(rotation);
            const baseMaterial = node.material as THREE.MeshStandardMaterial;
            let color = null;
            let geomGroup = 'colored';
            if (baseMaterial.map) {
                const image = baseMaterial.map.image;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0);
                const imageData = context.getImageData(0, 0, image.width, image.height);
                const textureId = XXH.h32(imageData.data, 0).toString(16);
                geomGroup = `textured_${textureId}`;
                if (!(geomGroup in replacements.geometries)) {
                    replacements.geometries[geomGroup] = {
                        index: [],
                        positions: [],
                        normals: [],
                        colors: null,
                        uvs: [],
                        material: new THREE.RawShaderMaterial({
                            vertexShader: compile('vert', VERT_OBJECTS_TEXTURED),
                            fragmentShader: compile('frag', FRAG_OBJECTS_TEXTURED),
                            uniforms: {
                                uTexture: {value: baseMaterial.map},
                                lutTexture: {value: replacementData.lutTexture},
                                palette: {value: replacementData.paletteTexture},
                                light: {value: replacementData.light}
                            }
                        })
                    };
                }
            }
            const {
                index,
                positions,
                normals,
                colors,
                uvs
            } = replacements.geometries[geomGroup];
            if (!baseMaterial.map) {
                const mColor = baseMaterial.color.clone().convertLinearToGamma();
                color = new THREE.Vector3().fromArray(mColor.toArray());
            }
            const offset = positions.length / 3;
            for (let i = 0; i < index_attr.count; i += 1) {
                index.push(offset + index_attr.array[i]);
            }
            for (let i = 0; i < pos_attr.count; i += 1) {
                const x = pos_attr.getX(i);
                const y = pos_attr.getY(i);
                const z = pos_attr.getZ(i);
                POS.set(x, y, z);
                POS.applyMatrix4(transform);
                positions.push(POS.x, POS.y, POS.z);
                const nx = normal_attr.getX(i);
                const ny = normal_attr.getY(i);
                const nz = normal_attr.getZ(i);
                NORM.set(nx, ny, nz);
                NORM.applyMatrix3(normalMatrix);
                NORM.normalize();
                normals.push(NORM.x, NORM.y, NORM.z);
                if (colors) {
                    colors.push(color.x * 255, color.y * 255, color.z * 255);
                }
                if (uvs) {
                    uvs.push(uv_attr.getX(i), uv_attr.getY(i));
                }
            }
        }
    });
}

async function loadReplacementData(ambience) {
    const [lutTexture, ress] = await Promise.all([
        await loadLUTTexture(),
        await getResource('RESS')
    ]);
    const palette = new Uint8Array(ress.getEntry(0));
    const paletteTexture = loadPaletteTexture(palette);
    const light = getLightVector(ambience);
    return {
        paletteTexture,
        lutTexture,
        light
    };
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
