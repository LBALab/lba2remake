import { getAnimations, getEntities, getModels, getPalette } from '../resources';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

import * as THREE from 'three';
import {each} from 'lodash';

import { saveAs } from 'file-saver';

// import { loadSubTextureRGBA } from '../texture';
import { PolygonType } from '../utils/lba';

const push = Array.prototype.push;

const exporter = new GLTFExporter();

export async function exportModel(
    entityIdx: number,
    bodyIdx: number,
) {
    const entityName = DebugData.metadata.entities[entityIdx] || `entity_${entityIdx}`;
    const bodyName = DebugData.metadata.bodies[bodyIdx] || `body_${bodyIdx}`;
    const name = `${entityName}_${bodyName}`;

    const body = await getModels(bodyIdx, entityIdx);
    const palette = await getPalette();
    const mesh = loadMesh(body, palette, name);
    const animations = await loadAnimations(entityIdx, body);

    exporter.parse(mesh, (gltf: ArrayBuffer) => {
        const blob = new Blob([gltf], {type: 'model/gltf-binary'});
        saveAs(blob, `${name}.glb`);
    }, {
        binary: true,
        embedImages: true,
        animations,
    });
}

async function loadAnimations(entityIdx, body) {
    const entities = await getEntities();
    const entity = entities[entityIdx];
    const clips = [];
    for (const animInfo of entity.anims) {
        const anim = await getAnimations(animInfo.index, entityIdx);
        const times = [];
        let t = 0.0;
        const numBones = Math.min(body.bones.length, anim.numBoneframes);
        for (let i = 0; i < anim.keyframes.length; i += 1) {
            times.push(t);
            t += anim.keyframes[i].duration / 1000;
        }
        const tracks = [];
        for (let b = 0; b < numBones; b += 1) {
            const type = anim.keyframes.length > 0 ? anim.keyframes[0].boneframes[b].type : 0;
            const values = [];
            for (let i = 0; i < anim.keyframes.length; i += 1) {
                const frame = anim.keyframes[i].boneframes[b];
                if (type === 0) {
                    const q = frame.quat;
                    values.push(q.x, q.y, q.z, q.w);
                } else {
                    const p = frame.pos;
                    values.push(p.x, p.y, p.z);
                }

            }
            const track = type === 0
                ? new THREE.QuaternionKeyframeTrack(`.bones[bone_${b}].quaternion`, times, values)
                : new THREE.VectorKeyframeTrack(`.bones[bone_${b}].position`, times, values);
            tracks.push(track);
        }
        const name = DebugData.metadata.anims[animInfo.index] || `anim_${animInfo.index}`;
        const clip = new THREE.AnimationClip(name, t, tracks);
        clips.push(clip);
    }
    return clips;
}

function loadMesh(body, palette, name) {
    const geometry = loadGeometry(body, palette);

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
        bones: boneIndices,
        material,
        colors,
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
    bufferGeometry.name = name;

    const modelMesh = new THREE.SkinnedMesh(bufferGeometry, material);
    modelMesh.name = name;
    modelMesh.matrixAutoUpdate = false;
    modelMesh.bind(skeleton);
    modelMesh.add(skeleton.bones[0]);
    return modelMesh;
}

function loadGeometry(body, palette) {
    const geometry = {
        positions: [],
        normals: [],
        colors: [],
        intensities: [],
        bones: [],
        polyTypes: [],
        linePositions: [],
        lineNormals: [],
        lineColors: [],
        lineIntensities: [],
        lineBones: [],
        material: new THREE.MeshStandardMaterial()
    };

    loadFaceGeometry(geometry, body, palette);
    loadSphereGeometry(geometry, body, palette);
    loadLineGeometry(geometry, body, palette);
    // debugBoneGeometry(geometries, body);

    return geometry;
}

function loadFaceGeometry(geometry, body, palette) {
    each(body.polygons, (p) => {
        const faceNormal = getFaceNormal(body, p);
        const addVertex = (j) => {
            const vertexIndex = p.vertex[j];
            push.apply(geometry.positions, getPosition(body, vertexIndex));
            push.apply(geometry.normals, faceNormal || getNormal(body, vertexIndex));
            push.apply(geometry.bones, getBone(body, vertexIndex));
            push.apply(geometry.colors, getColor(p.colour, p.intensity, palette));
        };
        for (let j = 0; j < 3; j += 1) {
            addVertex(j);
        }
        if (p.numVertex >= 4) { // quad
            each([0, 2, 3], (j) => {
                addVertex(j);
            });
        }
    });
}

function loadSphereGeometry(geometry, body, palette) {
    each(body.spheres, (s) => {
        const centerPos = getPosition(body, s.vertex);
        const sphereGeometry = new THREE.SphereGeometry(s.size, 8, 8);
        const normal = getNormal(body, s.vertex);

        const addVertex = (x, y, z) => {
            push.apply(geometry.positions, [
                x + centerPos[0],
                y + centerPos[1],
                z + centerPos[2]
            ]);
            push.apply(geometry.normals, normal);
            push.apply(geometry.bones, getBone(body, s.vertex));
            push.apply(geometry.colors, getColor(s.colour, s.intensity, palette));
        };

        const { array: vertex } = sphereGeometry.attributes.position;
        const { array: index, count } = sphereGeometry.index;
        for (let i = 0; i < count; i += 1) {
            const idx = index[i] * 3;
            addVertex(vertex[idx], vertex[idx + 1], vertex[idx + 2]);
        }
    });
}

const BASE = new THREE.Vector3(0, 1, 0);
const V1 = new THREE.Vector3();
const V2 = new THREE.Vector3();
const P = new THREE.Vector3();
const Q = new THREE.Quaternion();

function loadLineGeometry(geometry, body, palette) {
    each(body.lines, (line) => {
        const startPos = getPosition(body, line.vertex1);
        const endPos = getPosition(body, line.vertex2);
        V1.fromArray(startPos);
        V2.fromArray(endPos);
        V2.sub(V1);
        const dist = V2.length();
        V2.normalize();
        Q.setFromUnitVectors(BASE, V2);
        const segmentGeometry = new THREE.CylinderGeometry(0.005, 0.005, 1, 6, 1);
        const normal = getNormal(body, line.vertex1);

        const addVertex = (x, y, z) => {
            P.set(x, (y + 0.5) * dist, z);
            P.applyQuaternion(Q);
            push.apply(geometry.positions, [
                P.x + startPos[0],
                P.y + startPos[1],
                P.z + startPos[2]
            ]);
            push.apply(geometry.normals, normal);
            push.apply(geometry.bones, getBone(body, y > 0 ? line.vertex2 : line.vertex1));
            push.apply(geometry.colors, getColor(line.colour, line.intensity, palette));
        };

        const { array: vertex } = segmentGeometry.attributes.position;
        const { array: index, count } = segmentGeometry.index;
        for (let i = 0; i < count; i += 1) {
            const idx = index[i] * 3;
            addVertex(vertex[idx], vertex[idx + 1], vertex[idx + 2]);
        }
    });
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

const U = new THREE.Vector3();
const V = new THREE.Vector3();
const P1 = new THREE.Vector3();

// Face normal algorithm from:
// https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
function getFaceNormal(body, poly) {
    if (poly.polyType === PolygonType.FLAT) {
        P1.fromArray(getPosition(body, poly.vertex[0]));
        U.fromArray(getPosition(body, poly.vertex[1])).sub(P1);
        V.fromArray(getPosition(body, poly.vertex[2])).sub(P1);
        return [
            (U.y * V.z) - (U.z * V.y),
            (U.z * V.x) - (U.x * V.z),
            (U.x * V.y) - (U.y * V.x),
        ];
    }
    return null;
}

function getNormal(body, index) {
    const normal = body.normals[index];
    if (!normal) {
        return [0, 1, 0];
    }
    return [
        normal.x,
        normal.y,
        normal.z/* ,
        normal.colour */
    ];
}
