import * as THREE from 'three';
import { each, last } from 'lodash';
import XXH from 'xxhashjs';

import { loadLUTTexture } from '../../utils/lut';
import { loadPaletteTexture } from '../../texture';
import VERT_OBJECTS_COLORED from '../shaders/objects/colored.vert.glsl';
import FRAG_OBJECTS_COLORED from '../shaders/objects/colored.frag.glsl';
import VERT_OBJECTS_TEXTURED from '../shaders/objects/textured.vert.glsl';
import FRAG_OBJECTS_TEXTURED from '../shaders/objects/textured.frag.glsl';
import { compile } from '../../utils/shaders';
import { loadFullSceneModel } from './models';
import { loadResource, ResourceType } from '../../resources';
import { getPartialMatrixWorld } from '../../utils/math';

export async function initReplacements(entry, metadata, ambience) {
    const data = await loadReplacementData(ambience);
    if (metadata.hasFullReplacement) {
        const { threeObject, mixer } = await loadFullSceneModel(entry, data);
        return {
            threeObject,
            mixer,
            geometries: null,
            bricks: new Set()
        };
    }
    if (!metadata.mergeReplacements) {
        return {
            threeObject: null,
            mixer: null,
            geometries: null,
            bricks: new Set()
        };
    }
    return {
        threeObject: initReplacementObject(entry),
        mixer: null,
        mergeReplacements: true,
        animations: [],
        geometries: makeReplacementGeometries(data),
        data,
        idCounters: {
            animId: 0,
            originalGeomId: 0,
            transparentGeomId: 0
        },
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
        if (checkMatch(grid, cellInfo, replacements)) {
            suppressBricks(replacements, cellInfo.layout, x, y, z);
            if (replacements.mergeReplacements) {
                addReplacementObject(
                    cellInfo,
                    replacements,
                    x - (nX * 0.5) + 1,
                    realY - 0.5,
                    realZ - (nZ * 0.5) + 1
                );
            }
        }
    }
}

export function buildReplacementMeshes({ geometries, threeObject }) {
    each(geometries, (geom, key) => {
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
                    new THREE.BufferAttribute(new Uint8Array(geom.colors), 4, true)
                );
            }
            const mesh = new THREE.Mesh(bufferGeometry, geom.material);
            mesh.name = key;
            threeObject.add(mesh);
        }
    });
}

function initReplacementObject(entry) {
    const threeObject = new THREE.Object3D();
    threeObject.name = `replacements_for_iso_${entry}`;
    return threeObject;
}

function makeReplacementGeometries(data) {
    return {
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
    };
}

function checkMatch(grid, cellInfo, replacements) {
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
                if (!column[yGrid]) {
                    continue;
                }
                if (column[yGrid].layout !== layout) {
                    const gridLayoutInfo = grid.library.layouts[column[yGrid].layout];
                    let skip = false;
                    if (gridLayoutInfo) {
                        const brick = gridLayoutInfo.blocks[column[yGrid].block].brick;
                        const idx = (nX - x - 1) + y * nX + (nZ - z - 1) * nX * nY;
                        const brickLayout = blocks[idx];
                        if (brick !== brickLayout) {
                            skip = true;
                        }
                    }
                    if (!skip) {
                        return false;
                    }
                }
                if (replacements.bricks.has(`${xGrid},${yGrid},${zGrid}`)) {
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

const identityMatrix = new THREE.Matrix4();

export async function addReplacementObject(info, replacements, gx, gy, gz) {
    const { threeObject, animations, orientation } = info;
    const scale = 1 / 0.75;
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

    const bindings = [];
    if (animations && animations.length) {
        each(animations, (animationBase) => {
            const animation = animationBase.clone(true);
            const {tracks} = animation;
            each(tracks, (track) => {
                bindings.push({
                    track,
                    binding: new THREE.PropertyBinding(threeObject, track.name)
                });
            });
            replacements.animations.push(animation);
        });
    }

    const skip = new Set();
    const animNodes = [];
    const animRoot = new THREE.Object3D();
    animRoot.name = threeObject.name.replace(/\./g, '_');
    animRoot.position.set(gx, gy, gz);
    animRoot.quaternion.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        angle
    );
    animRoot.scale.set(scale, scale, scale);
    animRoot.updateMatrix();
    animRoot.updateMatrixWorld(true);

    threeObject.traverse((node) => {
        node.updateMatrix();
        node.updateMatrixWorld(true);
        each(bindings, ({binding, track}) => {
            if (binding.node === node) {
                if (node.parent !== threeObject) {
                    // tslint:disable-next-line: no-console
                    console.warn('Animations must only apply to direct children', binding);
                }
                const group = new THREE.Object3D();
                group.name = `${node.name}_${replacements.idCounters.animId}`;
                replacements.idCounters.animId += 1;
                group.position.copy(node.position);
                group.quaternion.copy(node.quaternion);
                group.scale.copy(node.scale);
                group.updateMatrix();
                group.updateMatrixWorld(true);
                track.name = `${group.uuid}.${binding.parsedPath.propertyName}`;
                animRoot.add(group);
                skip.add(node);
                animNodes.push({
                    group,
                    node,
                    data: {
                        idCounters: replacements.idCounters,
                        data: replacements.data,
                        geometries: makeReplacementGeometries(replacements.data)
                    }
                });
                return;
            }
        });
        if (skip.has(node.parent)) {
            skip.add(node);
            if (node instanceof THREE.Mesh) {
                const matrixWorld = getPartialMatrixWorld(node, last(animNodes).node);
                appendMeshGeometry(last(animNodes).data, identityMatrix, node, angle, matrixWorld);
            }
            return;
        }
        if (node instanceof THREE.Mesh) {
            appendMeshGeometry(replacements, gTransform, node, angle);
        }
    });
    each(animNodes, ({group, data}) => {
        buildReplacementMeshes({
            geometries: data.geometries,
            threeObject: group
        });
    });
    if (animRoot.children.length > 0) {
        replacements.threeObject.add(animRoot);
    }
}

const POS = new THREE.Vector3();
const NORM = new THREE.Vector3();

function appendMeshGeometry(
    {idCounters, geometries, data},
    gTransform,
    node,
    angle,
    matrixWorld = null
) {
    const transform = gTransform.clone();
    transform.multiply(matrixWorld || node.matrixWorld);

    const geom = node.geometry as THREE.BufferGeometry;
    const pos_attr = geom.attributes.position;
    const normal_attr = geom.attributes.normal;
    const uv_attr = geom.attributes.uv;
    const index_attr = geom.index;

    const rotation = new THREE.Matrix4();
    if (!matrixWorld) {
        rotation.makeRotationY(angle - Math.PI / 2);
        rotation.multiply(node.matrixWorld);
    }
    const normalMatrix = new THREE.Matrix3();
    normalMatrix.setFromMatrix4(rotation);
    const baseMaterial = node.material as THREE.MeshStandardMaterial;
    let color = null;
    let geomGroup = 'colored';
    let groupType = null;
    if (baseMaterial.name.substring(0, 8) === 'keepMat_') {
        geomGroup = `original_${idCounters.originalGeomId}`;
        groupType = 'original';
        idCounters.originalGeomId += 1;
    } else if (baseMaterial.map) {
        const image = baseMaterial.map.image;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, image.width, image.height);
        const textureId = XXH.h32(imageData.data.buffer, 0).toString(16);
        geomGroup = `textured_${textureId}`;
        groupType = 'textured';
    } else if (baseMaterial.opacity < 1) {
        geomGroup = `transparent_${idCounters.transparentGeomId}`;
        groupType = 'transparent';
        idCounters.transparentGeomId += 1;
    }
    if (!(geomGroup in geometries)) {
        switch (groupType) {
            case 'textured':
                geometries[geomGroup] = {
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
                            lutTexture: {value: data.lutTexture},
                            palette: {value: data.paletteTexture},
                            light: {value: data.light}
                        }
                    })
                };
                break;
            case 'transparent':
                geometries[geomGroup] = {
                    index: [],
                    positions: [],
                    normals: [],
                    colors: [],
                    material: new THREE.RawShaderMaterial({
                        vertexShader: compile('vert', VERT_OBJECTS_COLORED),
                        fragmentShader: compile('frag', FRAG_OBJECTS_COLORED),
                        uniforms: {
                            lutTexture: {value: data.lutTexture},
                            palette: {value: data.paletteTexture},
                            light: {value: data.light}
                        }
                    })
                };
                break;
            case 'original':
                geometries[geomGroup] = {
                    index: [],
                    positions: [],
                    normals: [],
                    uvs: baseMaterial.map ? [] : null,
                    colors: null,
                    material: baseMaterial
                };
                break;
        }
    }
    const {
        index,
        positions,
        normals,
        colors,
        uvs
    } = geometries[geomGroup];
    if (!baseMaterial.map) {
        const mColor = baseMaterial.color.clone().convertLinearToGamma();
        color = new THREE.Vector4().fromArray(
            [...mColor.toArray(), baseMaterial.opacity]
        );
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
            colors.push(color.x * 255, color.y * 255, color.z * 255, color.w * 255);
        }
        if (uvs) {
            uvs.push(uv_attr.getX(i), uv_attr.getY(i));
        }
    }
}

async function loadReplacementData(ambience) {
    const [lutTexture, ress] = await Promise.all([
        await loadLUTTexture(),
        await loadResource(ResourceType.RESS)
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
