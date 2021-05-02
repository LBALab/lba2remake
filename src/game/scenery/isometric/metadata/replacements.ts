import * as THREE from 'three';
import { each, last, find } from 'lodash';
import XXH from 'xxhashjs';

import { loadLUTTexture } from '../../../../utils/lut';
import { loadPaletteTexture } from '../../../../texture';
import VERT_OBJECTS_COLORED from '../shaders/objects/colored.vert.glsl';
import FRAG_OBJECTS_COLORED from '../shaders/objects/colored.frag.glsl';
import VERT_OBJECTS_TEXTURED from '../shaders/objects/textured.vert.glsl';
import FRAG_OBJECTS_TEXTURED from '../shaders/objects/textured.frag.glsl';
import VERT_OBJECTS_DOME from '../shaders/objects/dome.vert.glsl';
import FRAG_OBJECTS_DOME from '../shaders/objects/dome.frag.glsl';
import { compile } from '../../../../utils/shaders';
import { loadFullSceneModel } from './models';
import { getCommonResource } from '../../../../resources';
import { getPartialMatrixWorld } from '../../../../utils/math';
import { GROUND_TYPES } from '../grid';

export async function initReplacements(
    entry,
    layoutsMetadata,
    ambience,
    isEditor: boolean,
    numActors: number
) {
    const data = await loadReplacementData(ambience);
    if (layoutsMetadata.hasFullReplacement) {
        const { threeObject, update } = await loadFullSceneModel(entry, data, isEditor, numActors);
        return {
            threeObject,
            update,
            geometries: null,
            bricks: new Set(),
            data
        };
    }
    if (!layoutsMetadata.mergeReplacements) {
        return {
            threeObject: null,
            update: null,
            geometries: null,
            bricks: new Set(),
            data
        };
    }
    return {
        threeObject: initReplacementObject(entry),
        update: null,
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

export function applyReplacement(x, y, z, replacements, target) {
    const { nX, nZ } = target.data;
    const realY = (y * 0.5) + 0.5;
    const realZ = z - 1;
    suppressTargetBricks(replacements, target.data, x, y, z);
    if (replacements.mergeReplacements) {
        addReplacementObject(
            target.replacementData,
            replacements,
            x - (nX * 0.5) + 1,
            realY - 0.5,
            realZ - (nZ * 0.5) + 1
        );
    }
}

function suppressTargetBricks(replacements, targetData, xStart, yStart, zStart) {
    const { nX, nY, nZ } = targetData;
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
            if (key.substring(0, 9) === 'textured_' || (geom.uvs && geom.uvs.length > 0)) {
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

const angleMapping = [
    Math.PI / 2.0,
    Math.PI,
    -Math.PI / 2.0,
    0,
];

const identityMatrix = new THREE.Matrix4();

async function addReplacementObject(info, replacements, gx, gy, gz) {
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

    const skipMeshes = [];
    const trackReplacements = {};

    threeObject.traverse((node) => {
        if (node instanceof THREE.Mesh && node.morphTargetInfluences) {
            const newMesh = node.clone();
            const matrixWorld = getPartialMatrixWorld(node, threeObject);
            newMesh.matrix.copy(gTransform);
            newMesh.matrix.multiply(matrixWorld);
            newMesh.matrix.decompose(
                newMesh.position,
                newMesh.quaternion,
                newMesh.scale
            );
            newMesh.name = newMesh.uuid;
            newMesh.updateMatrixWorld(true);
            replacements.threeObject.add(newMesh);
            skipMeshes.push(node);
            if (animations && animations.length) {
                for (const animation of animations) {
                    const {tracks} = animation;
                    for (const track of tracks) {
                        const binding = new THREE.PropertyBinding(threeObject, track.name);
                        if (binding.node === node) {
                            trackReplacements[track.name] = `${newMesh.uuid}.${binding.parsedPath.propertyName}`;
                        }
                    }
                }
            }
        }
    });

    const bindings = [];
    if (animations && animations.length) {
        for (const animationBase of animations) {
            const animation = animationBase.clone(true);
            const {tracks} = animation;
            for (const track of tracks) {
                if (track.name in trackReplacements) {
                    track.name = trackReplacements[track.name];
                } else {
                    bindings.push({
                        track,
                        binding: new THREE.PropertyBinding(threeObject, track.name)
                    });
                }
            }
            replacements.animations.push(animation);
        }
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
        if (skipMeshes.includes(node)) {
            return;
        }
        node.updateMatrix();
        node.updateMatrixWorld(true);
        for (const {binding, track} of bindings) {
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
            }
        }
        if (skip.has(node.parent)) {
            skip.add(node);
            if (node instanceof THREE.Mesh) {
                const matrixWorld = getPartialMatrixWorld(node, last(animNodes).node);
                appendMeshGeometry(
                    last(animNodes).data, identityMatrix, node, info, angle, matrixWorld
                );
            }
            return;
        }
        if (node instanceof THREE.Mesh) {
            appendMeshGeometry(replacements, gTransform, node, info, angle);
        }
    });
    for (const {group, data} of animNodes) {
        buildReplacementMeshes({
            geometries: data.geometries,
            threeObject: group
        });
    }
    if (animRoot.children.length > 0) {
        replacements.threeObject.add(animRoot);
    }
}

const POS = new THREE.Vector3();
const NORM = new THREE.Vector3();

const textureIdCache = {};
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

function appendMeshGeometry(
    {idCounters, geometries, data},
    gTransform,
    node,
    info,
    angle,
    matrixWorld = null
) {
    const isDomeFloor = !!find(
        info.layout.blocks,
        b => b && b.groundType === GROUND_TYPES.DOME_OF_THE_SLATE_FLOOR
    );
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
    if (isDomeFloor) {
        geomGroup = 'dome_floor';
        groupType = 'dome_floor';
    } else if (baseMaterial.name.substring(0, 8) === 'keepMat_') {
        geomGroup = `original_${idCounters.originalGeomId}`;
        groupType = 'original';
        idCounters.originalGeomId += 1;
    } else if (baseMaterial.map) {
        const texture = baseMaterial.map;
        if (texture.uuid in textureIdCache) {
            geomGroup = `textured_${textureIdCache[texture.uuid]}`;
        } else {
            const image = texture.image;
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);
            const imageData = context.getImageData(0, 0, image.width, image.height);
            const textureId = XXH.h32(imageData.data.buffer, 0).toString(16);
            textureIdCache[texture.uuid] = textureId;
            geomGroup = `textured_${textureId}`;
        }
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
            case 'dome_floor':
                geometries[geomGroup] = {
                    index: [],
                    positions: [],
                    normals: [],
                    colors: [],
                    material: new THREE.RawShaderMaterial({
                        vertexShader: VERT_OBJECTS_DOME,
                        fragmentShader: FRAG_OBJECTS_DOME,
                        uniforms: {
                            heroPos: { value: new THREE.Vector3() }
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
        await getCommonResource()
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
