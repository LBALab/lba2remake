import { getAnimations, getEntities, getModels, getModelsTexture, getPalette } from '../resources';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

import * as THREE from 'three';

import { saveAs } from 'file-saver';
import { loadSubTextureRGBA } from '../texture';
import { PolygonType } from '../utils/lba';

const push = Array.prototype.push;

const exporter = new GLTFExporter();

export async function exportModel(
    entityIdx: number,
    bodyIdx: number,
) {
    const entityName = DebugData.metadata.entities[entityIdx] || `entity_${entityIdx}`;
    const bodyName = DebugData.metadata.bodies[bodyIdx] || `body_${bodyIdx}`;
    const bodySuffix = bodyName === 'default' ? '' : `_${bodyName}`;
    const name = `${entityName}${bodySuffix}`;

    const body = await getModels(bodyIdx, entityIdx);
    const palette = await getPalette();
    const texture = await getModelsTexture();
    const mesh = loadMesh(body, texture, palette, name);
    mesh.userData.isRoot = true;
    mesh.userData.entityName = entityName;
    mesh.userData.bodyName = bodyName;
    mesh.userData.entityIdx = entityIdx;
    mesh.userData.bodyIdx = bodyIdx;
    const animations = await loadAnimations(entityIdx, body, mesh.skeleton);

    exporter.parse(mesh, (gltf: ArrayBuffer) => {
        const blob = new Blob([gltf], {type: 'model/gltf-binary'});
        saveAs(blob, `${name}.glb`);
    }, undefined, {
        binary: true,
        embedImages: true,
        animations,
    });
}

async function loadAnimations(entityIdx, body, skeleton: THREE.Skeleton) {
    const entities = await getEntities();
    const entity = entities[entityIdx];
    const clips = [];
    for (const animInfo of entity.anims) {
        const anim = await getAnimations(animInfo.index, entityIdx);
        if (anim.loopFrame > 0) {
            const animClip1 = makeAnimationClip(animInfo, anim, body, skeleton, true);
            if (animClip1) {
                clips.push(animClip1);
            }
        }
        const animClip2 = makeAnimationClip(animInfo, anim, body, skeleton, false);
        if (animClip2) {
            clips.push(animClip2);
        }
    }
    return clips;
}

function makeAnimationClip(animInfo, anim, body, skeleton: THREE.Skeleton, intro: boolean) {
    const times = [];
    let t = 0.0;
    const numBones = Math.min(body.bones.length, anim.numBoneframes);
    const min = intro ? 0 : anim.loopFrame;
    const max = intro ? anim.loopFrame : anim.numKeyframes;
    for (let i = min; i < max; i += 1) {
        times.push(t);
        t += anim.keyframes[i].duration / 1000;
    }
    times.push(t);
    const tracks = [];
    for (let b = 0; b < numBones; b += 1) {
        const type = anim.keyframes.length > 0 ? anim.keyframes[0].boneframes[b].type : 0;
        const values = [];
        for (let i = min; i <= max; i += 1) {
            const frameNum = intro ? i : (i === max ? min : i);
            if (frameNum >= anim.keyframes.length) {
                return null;
            }
            const frame = anim.keyframes[frameNum].boneframes[b];
            if (type === 0) {
                const q = frame.quat;
                values.push(q.x, q.y, q.z, q.w);
            } else {
                const p = frame.pos;
                const bp = skeleton.bones[b].position;
                values.push(
                    bp.x + p.x,
                    bp.y + p.y,
                    bp.z + p.z
                );
            }
        }
        const track = type === 0
            ? new THREE.QuaternionKeyframeTrack(`.bones[bone_${b}].quaternion`, times, values)
            : new THREE.VectorKeyframeTrack(`.bones[bone_${b}].position`, times, values);
        tracks.push(track);
    }
    const name = DebugData.metadata.anims[animInfo.index] || `anim_${animInfo.index}`;
    const suffix = intro ? '.intro' : '';
    return new THREE.AnimationClip(`${name}${suffix}`, t, tracks);
}

function loadMesh(body, texture, palette, name): THREE.SkinnedMesh {
    const geometry = loadGeometry(body, texture, palette);

    const bones: THREE.Bone[] = [];
    for (let i = 0; i < body.bones.length; i += 1) {
        const bone = body.bones[i];
        const b = new THREE.Bone();
        b.name = `bone_${i}`;
        const pos = body.vertices[bone.vertex];
        b.position.set(
            pos.x,
            pos.y,
            pos.z
        );
        bones.push(b);
    }
    for (let i = 0; i < body.bones.length; i += 1) {
        const bone = body.bones[i];
        if (bone.parent !== 0xFFFF) {
            bones[bone.parent].add(bones[i]);
        }
    }
    const skeleton = new THREE.Skeleton(bones);

    const {
        positions,
        normals,
        boneIndices,
        materials,
        colors,
        uvs,
    } = geometry;

    if (positions.length === 0) {
        throw new Error('Invalid model');
    }

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(positions), 3)
    );
    bufferGeometry.setAttribute(
        'normal',
        new THREE.BufferAttribute(new Float32Array(normals), 3)
    );
    const skinIndex = new Uint8Array(boneIndices.length * 4);
    const skinWeights = new Float32Array(boneIndices.length * 4);
    for (let i = 0; i < boneIndices.length; i += 1) {
        skinIndex[i * 4] = boneIndices[i];
        skinWeights[i * 4] = 1;
        skinIndex[i * 4 + 1] = 0;
        skinWeights[i * 4 + 1] = 0;
        skinIndex[i * 4 + 2] = 0;
        skinWeights[i * 4 + 2] = 0;
        skinIndex[i * 4 + 3] = 0;
        skinWeights[i * 4 + 3] = 0;
    }
    bufferGeometry.setAttribute(
        'skinIndex',
        new THREE.BufferAttribute(skinIndex, 4)
    );
    bufferGeometry.setAttribute(
        'skinWeight',
        new THREE.BufferAttribute(skinWeights, 4)
    );
    bufferGeometry.setAttribute(
        'color',
        new THREE.BufferAttribute(new Uint8Array(colors), 4, true)
    );
    bufferGeometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(new Float32Array(uvs), 2)
    );
    bufferGeometry.name = name;
    bufferGeometry.clearGroups();
    for (const group of geometry.groups) {
        bufferGeometry.addGroup(group.start, group.count, group.mat);
    }
    bufferGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array(geometry.indices), 1));

    const modelMesh = new THREE.SkinnedMesh(bufferGeometry, materials);
    modelMesh.name = name;
    modelMesh.matrixAutoUpdate = false;
    modelMesh.bind(skeleton);
    modelMesh.add(skeleton.bones[0]);
    return modelMesh;
}

function loadGeometry(body, texture, palette) {
    const geometry = {
        currentMat: -1,
        groups: [],
        positions: [],
        normals: [],
        colors: [],
        indices: [],
        boneIndices: [],
        uvs: [],
        texGroups: {},
        materials: [
            new THREE.MeshStandardMaterial({
                name: 'lba_default_lit'
            }),
            new THREE.MeshBasicMaterial({
                name: 'lba_default_unlit',
            }),
        ],
    };

    loadFaceGeometry(geometry, body, texture, palette);
    loadSphereGeometry(geometry, body, palette);
    loadLineGeometry(geometry, body, palette);
    finishMaterialState(geometry);

    return geometry;
}

function finishMaterialState(geometry) {
    if (geometry.groups.length > 0) {
        const lastGroup = geometry.groups[geometry.groups.length - 1];
        lastGroup.count = (geometry.indices.length) - lastGroup.start;
        if (lastGroup.count === 0) {
            geometry.groups.pop();
        }
    }
}

function setMaterialState(geometry, mat) {
    if (geometry.currentMat !== mat) {
        finishMaterialState(geometry);
        geometry.groups.push({
            mat,
            start: geometry.indices.length,
        });
        geometry.currentMat = mat;
    }
}

function loadFaceGeometry(geometry, body, texture, palette) {
    setMaterialState(geometry, 0);
    const usedColors = [];
    const colorMap = new Map<string, number>();
    for (let i = 0; i < body.vertices.length; i += 1) {
        push.apply(geometry.positions, getPosition(body, i));
        push.apply(geometry.normals, getNormal(body, i));
        push.apply(geometry.boneIndices, getBone(body, i));
        push.apply(geometry.uvs, [0, 0]);
        push.apply(geometry.colors, [0xFF, 0xFF, 0xFF, 0xFF]);
    }

    const sameColor = (idx, color) =>
        geometry.colors[idx * 4] === color[0] &&
        geometry.colors[idx * 4 + 1] === color[1] &&
        geometry.colors[idx * 4 + 2] === color[2] &&
        geometry.colors[idx * 4 + 3] === color[3];

    for (const p of body.polygons) {
        const uvGroup = getUVGroup(body, p);
        if (uvGroup) {
            const matIndex = getTexMaterialIndex(geometry, uvGroup, texture);
            setMaterialState(geometry, matIndex);
        } else {
            setMaterialState(geometry, 0);
        }

        const faceNormal = getFaceNormal(body, p);

        const addVertex = (j) => {
            let vertexIndex = p.vertex[j];
            const color = getColor(p.colour, p.intensity, palette);

            const pushVertex = (useFaceNormal = false) => {
                const newIndex = geometry.positions.length / 3;
                push.apply(geometry.positions, getPosition(body, vertexIndex));
                push.apply(geometry.normals, useFaceNormal
                    ? faceNormal
                    : getNormal(body, vertexIndex)
                );
                push.apply(geometry.boneIndices, getBone(body, vertexIndex));
                push.apply(geometry.colors, color);
                push.apply(geometry.uvs, getUVs(uvGroup, p, j));
                vertexIndex = newIndex;
            };

            if (p.polyType === PolygonType.FLAT) {
                pushVertex(true);
            } else if (uvGroup) {
                pushVertex();
            } else if (!usedColors[vertexIndex]) {
                geometry.colors[vertexIndex * 4] = color[0];
                geometry.colors[vertexIndex * 4 + 1] = color[1];
                geometry.colors[vertexIndex * 4 + 2] = color[2];
                geometry.colors[vertexIndex * 4 + 3] = color[3];
                usedColors[vertexIndex] = true;
            } else if (!sameColor(vertexIndex, color)) {
                const key = `${vertexIndex}:${color[0]},${color[1]},${color[2]},${color[3]}`;
                if (colorMap.has(key)) {
                    vertexIndex = colorMap.get(key);
                } else {
                    pushVertex();
                    colorMap.set(key, vertexIndex);
                }
            }
            geometry.indices.push(vertexIndex);
        };
        for (let j = 0; j < 3; j += 1) {
            addVertex(j);
        }
        if (p.numVertex >= 4) { // quad
            for (const j of [0, 2, 3]) {
                addVertex(j);
            }
        }
    }
}

function loadSphereGeometry(geometry, body, palette) {
    setMaterialState(geometry, 1);
    for (const s of body.spheres) {
        const centerPos = getPosition(body, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(s.size, 8, 8);
        const baseIndex = geometry.positions.length / 3;

        const color = getColor(s.colour, s.intensity, palette);
        const bone = getBone(body, s.vertex);

        const { array: vertex } = sphereGeometry.attributes.position;
        const { array: normals } = sphereGeometry.attributes.normal;
        const { array: index, count } = sphereGeometry.index;
        for (let i = 0; i < vertex.length; i += 3) {
            push.apply(geometry.positions, [
                vertex[i] + centerPos[0],
                vertex[i + 1] + centerPos[1],
                vertex[i + 2] + centerPos[2]
            ]);
            push.apply(geometry.normals, [
                normals[i],
                normals[i + 1],
                normals[i + 2]
            ]);
            push.apply(geometry.boneIndices, bone);
            push.apply(geometry.colors, color);
            push.apply(geometry.uvs, [0, 0]);
        }
        for (let i = 0; i < count; i += 1) {
            geometry.indices.push(baseIndex + index[i]);
        }
    }
}

const BASE = new THREE.Vector3(0, 1, 0);
const V1 = new THREE.Vector3();
const V2 = new THREE.Vector3();
const P = new THREE.Vector3();
const Q = new THREE.Quaternion();

function loadLineGeometry(geometry, body, palette) {
    setMaterialState(geometry, 1);
    for (const line of body.lines) {
        const baseIndex = geometry.positions.length / 3;

        const startPos = getPosition(body, line.vertex1);
        const endPos = getPosition(body, line.vertex2);
        V1.fromArray(startPos);
        V2.fromArray(endPos);
        V2.sub(V1);
        const dist = V2.length();
        V2.normalize();
        Q.setFromUnitVectors(BASE, V2);

        const thickness = 0.002;
        const segmentGeometry = new THREE.CylinderGeometry(thickness, thickness, 1, 6, 1);
        const color = getColor(line.colour, line.intensity, palette);

        const { array: vertex } = segmentGeometry.attributes.position;
        const { array: normals } = segmentGeometry.attributes.normal;
        const { array: index, count } = segmentGeometry.index;
        for (let i = 0; i < vertex.length; i += 3) {
            P.set(
                vertex[i],
                (vertex[i + 1] + 0.5) * dist,
                vertex[i + 2]
            );
            P.applyQuaternion(Q);
            push.apply(geometry.positions, [
                P.x + startPos[0],
                P.y + startPos[1],
                P.z + startPos[2]
            ]);
            const bone = getBone(body, vertex[i + 1] > 0 ? line.vertex2 : line.vertex1);
            P.set(
                normals[i],
                normals[i + 1],
                normals[i + 2]
            );
            P.applyQuaternion(Q);
            push.apply(geometry.normals, [
                P.x,
                P.y,
                P.z
            ]);
            push.apply(geometry.boneIndices, bone);
            push.apply(geometry.colors, color);
            push.apply(geometry.uvs, [0, 0]);
        }
        for (let i = 0; i < count; i += 1) {
            geometry.indices.push(baseIndex + index[i]);
        }
    }
}

function getBone(body, index) {
    const vertex = body.vertices[index];
    return [vertex.bone];
}

function getPosition(body, index) {
    const vertex = body.vertices[index];
    return [
        vertex.x,
        vertex.y,
        vertex.z
    ];
}

function getColor(color, intensity, palette) {
    const index = color * 16 + intensity;
    return [
        palette[index * 3],
        palette[index * 3 + 1],
        palette[index * 3 + 2],
        0xFF
    ];
}

function getUVs(uvGroup, p, vertex) {
    if (p.hasTex) {
        return [
            p.u[vertex] / (uvGroup[2] + 1),
            p.v[vertex] / (uvGroup[3] + 1)
        ];
    }
    return [0, 0];
}

function getUVGroup(body, p) {
    if (p.hasTex) {
        return body.uvGroups[p.tex];
    }
    return null;
}

const U = new THREE.Vector3();
const V = new THREE.Vector3();
const P1 = new THREE.Vector3();
const N = new THREE.Vector3();

// Face normal algorithm from:
// https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
function getFaceNormal(body, poly) {
    if (poly.polyType !== PolygonType.FLAT) {
        return null;
    }
    P1.fromArray(getPosition(body, poly.vertex[0]));
    U.fromArray(getPosition(body, poly.vertex[1])).sub(P1);
    V.fromArray(getPosition(body, poly.vertex[2])).sub(P1);
    N.set(
        (U.y * V.z) - (U.z * V.y),
        (U.z * V.x) - (U.x * V.z),
        (U.x * V.y) - (U.y * V.x),
    );
    N.normalize();
    return [N.x, N.y, N.z];
}

function getNormal(body, index) {
    const normal = body.normals[index];
    if (!normal || (normal.x === 0 && normal.y === 0 && normal.z === 0)) {
        return [1, 0, 0];
    }
    N.set(normal.x, normal.y, normal.z);
    N.normalize();
    return [N.x, N.y, N.z];
}

function getTexMaterialIndex(geometries, group, baseTexture) {
    if (group in geometries.texGroups) {
        return geometries.texGroups[group];
    }
    let groupTexture = baseTexture;
    if (group.join(',') !== '0,0,255,255') {
        groupTexture = loadSubTextureRGBA(
            baseTexture.image.data,
            group[0],
            group[1],
            group[2] + 1,
            group[3] + 1
        );
    }
    const index = geometries.materials.length;
    geometries.texGroups[group] = index;
    geometries.materials.push(new THREE.MeshStandardMaterial({
        name: `lba_textured_${group.join('_')}`,
        map: groupTexture,
    }));
    return index;
}
