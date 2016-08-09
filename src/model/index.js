import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadHqrAsync} from '../hqr';
import {loadTexture} from '../texture';
import {loadEntity} from './entity';
import {loadBody} from './body';
import {loadAnim} from './anim';
import {loadBodyGeometry} from './geometry';

import vertexShader from './shaders/model.vert.glsl';
import fragmentShader from './shaders/model.frag.glsl';

export default function(models, index, entityIdx, bodyIdx, animIdx, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        body: loadHqrAsync('BODY.HQR'),
        anim: loadHqrAsync('ANIM.HQR'),
        anim3ds: loadHqrAsync('ANIM3DS.HQR')
    }, function(err, files) {
        callback(loadModel(files, models, index, entityIdx, bodyIdx, animIdx));
    });
}

/** Load Models Data
 *  Model will hold data specific to a single model instance.
 *  This will allow to mantain different states for body animations.
 *  This module will still kept data reloaded to avoid reload twice for now.
 */
function loadModel(files, model, index, entityIdx, bodyIdx, animIdx) {
    if (!model) {
        model = {
            files: files,
            palette: new Uint8Array(files.ress.getEntry(0)),
            entity: files.ress.getEntry(44),
            bodies: [],
            anims: [],
            object3D: []
        };
    }
 
    if (!model.entities) {
        model.entities = loadEntity(model.entity);
    }
    const entity = model.entities[entityIdx];
    //const realBodyIdx = entity.bodies[bodyIdx].index;
    //const realAnimIdx = entity.anims[animIdx].index;

    const body = loadBody(model, model.bodies, bodyIdx);
    const anim = loadAnim(model, model.anims, animIdx);

    if (!model.object3D[index]) {
        const obj = {
            mesh: null,
            skeleton: null,
            rootBone: null,
            currentFrame: 0,
            startFrame:0,
            lastFrame:0,
            currentTime:0,
            elapsedTime:0,
            matrixBones: []
        }
        const { skeleton,  rootBone} = createSkeleton(body);
        obj.skeleton = skeleton;
        obj.rootBone = rootBone;
        obj.matrixBones = createShaderBone(obj);

        const geometry = loadGeometry(model, body, obj.skeleton);

        obj.mesh = loadMesh(model, obj, geometry);
        model.object3D[index] = obj;
    } 
    return model;
}

function loadMesh(model, obj, geometry) {
    const material = new THREE.RawShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            body: {value: loadTexture(model.files.ress.getEntry(6), model.palette)},
            bones: {value: obj.matrixBones, type:'m4v'}
        }
    });

    const object = new THREE.Object3D();

    if (geometry.positions.length > 0) {
        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.positions), 3));
        bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Uint8Array(geometry.uvs), 2, true));
        bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(geometry.colors), 4, true));
        bufferGeometry.addAttribute('bone', new THREE.BufferAttribute(new Uint8Array(geometry.bones), 1));

        const modelMesh = new THREE.Mesh(bufferGeometry, material);
        object.add(modelMesh);
    }

    if (geometry.linePositions.length > 0) {
        const linebufferGeometry = new THREE.BufferGeometry();
        linebufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.linePositions), 3));
        linebufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(geometry.lineColors), 4, true));
        bufferGeometry.addAttribute('bone', new THREE.BufferAttribute(new Uint8Array(geometry.lineBones), 1));

        const lineSegments = new THREE.LineSegments(linebufferGeometry, material);
        object.add(lineSegments);
    }

    return object;
}

function loadGeometry(model, body, skeleton) {
    const geometry = {
        positions: [],
        uvs: [],
        colors: [],
        bones: [],
        linePositions: [],
        lineColors: [],
        lineBones: []
    };
    
    loadBodyGeometry(geometry, body, skeleton, model.palette);

    return geometry;
}

function createSkeleton(body) {
    let skeleton = [];
    let rootBone;
    for (let i = 0; i < body.bonesSize; ++i) {
        const bone = body.bones[i];
        const boneVertex = body.vertices[bone.vertex];

        let skeletonBone = {
            boneIndex: i,
            vertexIndex: bone.vertex,
            parent: bone.parent,
            vertex: new THREE.Vector3(boneVertex.x, boneVertex.y, boneVertex.z),
            pos: new THREE.Vector3(0, 0, 0),
            m: new THREE.Matrix4(),
            children: []
        }

        skeletonBone.m.setPosition(skeletonBone.vertex);

        skeleton.push(skeletonBone);
    }

    for (let i = 0; i < skeleton.length; ++i) {
        const bone = skeleton[i];
        if (bone.parent == 0xFFFF) {
            rootBone = bone;
            continue;
        }

        const s = skeleton[bone.parent];
        s.children.push(bone);
    }

    updateSkeletonHierarchy(skeleton, 0);

    return { skeleton, rootBone };
}

export function updateModel(model, index, animIdx, time) {
    const anim = loadAnim(model, model.anims, animIdx);
    updateKeyframe(anim, model.object3D[index], time);
}

function updateKeyframe(anim, obj, time) {
    obj.currentTime += time.delta;
    let keyframe = anim.keyframes[obj.currentFrame];
    if (obj.currentTime > keyframe.length) {
        obj.currentTime = 0;
        ++obj.currentFrame;
        if (obj.currentFrame >= anim.numKeyframes) {
            obj.currentFrame = obj.startFrame;
        }
        keyframe = anim.keyframes[obj.currentFrame];
    }

    let nextFrame = obj.currentFrame + 1;
    if (nextFrame >= anim.numKeyframes) {
        nextFrame = obj.startFrame;
    }
    const nextkeyframe = anim.keyframes[nextFrame];

    updateSkeletonAtKeyframe(obj.skeleton, keyframe, nextkeyframe, obj.currentTime);
    updateShaderBone(obj);
}

function updateSkeletonAtKeyframe(skeleton, keyframe, nextkeyframe, time) {
    const interpolation = time / keyframe.length; 
    for (let i = 0; i < skeleton.length; ++i) {
        const s = skeleton[i];
        const bf = keyframe.boneframes[i];
        const nbf = nextkeyframe.boneframes[i];

        s.m.identity();

        s.pos.copy(s.vertex);
        s.m.setPosition(s.pos);

        if (bf.type == 0) { // rotation
            const eulerX = bf.veuler.x + (nbf.veuler.x - bf.veuler.x) * interpolation;
            const eulerY = bf.veuler.y + (nbf.veuler.y - bf.veuler.y) * interpolation;
            const eulerZ = bf.veuler.z + (nbf.veuler.z - bf.veuler.z) * interpolation;
            //s.m.makeRotationFromEuler(new THREE.Euler(eulerX, eulerY, eulerZ, 'XZY'));
        } else { // translation
            s.pos.x = bf.pos.x + (nbf.pos.x - bf.pos.x) * interpolation;
            s.pos.y = bf.pos.y + (nbf.pos.y - bf.pos.y) * interpolation;
            s.pos.z = bf.pos.z + (nbf.pos.z - bf.pos.z) * interpolation;
            //s.m.setPosition(s.pos);
        }
    }

    updateSkeletonHierarchy(skeleton, 0);
}

function updateSkeletonHierarchy(skeleton, index) {
    const s = skeleton[index];
    const p = skeleton[index == 0 ? 0 : s.parent];
    if (s.parent != 0xFFFF) { // skip root
        const m = p.m.clone();
        m.multiply(s.m);
        s.m.copy(m);
    }
    for (let i = 0; i < s.children.length; ++i) {
        updateSkeletonHierarchy(skeleton, s.children[i].boneIndex);
    }
}

function createShaderBone(obj) {
    let bones = [];
    for (let i = 0; i < obj.skeleton.length; ++i) {
        bones.push(obj.skeleton[i].m);
    }
    for (let i = 0; i < 50 - obj.skeleton.length; ++i) {
        bones.push(new THREE.Matrix4());
    }
    return bones;
}

function updateShaderBone(obj) {
    for (let i = 0; i < obj.skeleton.length; ++i) {
        obj.matrixBones[i] = obj.skeleton[i].m;
    }
}
