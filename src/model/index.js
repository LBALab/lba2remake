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
            skeleton: createSkeleton(body),
            currentFrame: 0,
            startFrame:0,
            lastFrame:0,
            currentTime:0,
            elapsedTime:0,
            matrixBones: []
        }

        const geometry = loadGeometry(model, body, obj.skeleton);
        obj.verticies = geometry.positions;

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
            bones: {value: obj.matrixBones}
        }
    });

    const object = new THREE.Object3D();

    if (geometry.positions.length > 0) {
        const bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.positions), 3));
        bufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Uint8Array(geometry.uvs), 2, true));
        bufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(geometry.colors), 4, true));
        bufferGeometry.addAttribute('bone', new THREE.BufferAttribute(new Float32Array(geometry.bones), 1));

        const modelMesh = new THREE.Mesh(bufferGeometry, material);
        object.add(modelMesh);
    }

    if (geometry.linePositions.length > 0) {
        const linebufferGeometry = new THREE.BufferGeometry();
        linebufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.linePositions), 3));
        linebufferGeometry.addAttribute('color', new THREE.BufferAttribute(new Uint8Array(geometry.lineColors), 4, true));
        bufferGeometry.addAttribute('bone', new THREE.BufferAttribute(geometry.lineBones, 1));

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
    for (let i = 0; i < body.bonesSize; ++i) {
        const bone = body.bones[i];
        const boneVertex = body.vertices[bone.vertex];

        let skeletonBone = {
            boneIndex: i,
            vertexIndex: bone.vertex,
            parent: bone.parent,
            pos: new THREE.Vector3(boneVertex.x, boneVertex.y, boneVertex.z),
            m: new THREE.Matrix4()
        }

        skeletonBone.m.setPosition(skeletonBone.pos);

        skeleton.push(skeletonBone);
    }
    return skeleton;
}

export function updateModel(model, index, animIdx, time) {
    const anim = loadAnim(model, model.anims, animIdx);
    updateKeyframe(anim, model.object3D[index], time);
}

function updateKeyframe(anim, obj, time) {
    obj.currentTime += time.delta;
    obj.elapsedTime = time.delta;
    let keyframe = anim.keyframes[obj.currentFrame];
    if (obj.currentTime > keyframe.length) {
        obj.currentTime = 0;
        ++obj.currentFrame;
        if (obj.currentFrame >= anim.numKeyframes) {
            obj.currentFrame = obj.startFrame;
        }
        keyframe = anim.keyframes[obj.currentFrame];
    }

    let nextFrame = obj.currentFrame;
    if (nextFrame + 1 >= anim.numKeyframes) {
        nextFrame = obj.startFrame;    
    }
    const nextkeyframe = anim.keyframes[nextFrame];

    updateSkeletonAtKeyframe(obj.skeleton, keyframe, nextkeyframe, obj.currentTime);

    updateShaderBone(obj);
}

function updateSkeletonAtKeyframe(skeleton, keyframe, nextkeyframe, time) {
    const interpolation = time / skeleton.length; 
    for (let i = 0; i < skeleton.length; ++i) {
        const s = skeleton[i];
        const bf = keyframe.boneframes[i];
        const nbf = nextkeyframe.boneframes[i];

        switch (bf.type) {
            case 0: // rotation
                s.m.makeRotationFromEuler(bf.euler);
                break;
            case 1:
            case 2: // translation
                s.pos.add(bf.pos);
                s.m.setPosition(s.pos);
                break;
        }
    }

    // apply parent child
    for (let i = 0; i < skeleton.length; ++i) {
        const s = skeleton[i];
        let boneIdx = i;
        while(true) {
            const bone = skeleton[boneIdx];

            s.pos.add(bone.pos);

            if(bone.parent == 0xFFFF)
                break;
                
            boneIdx = bone.parent;
        }
    }
}

function updateShaderBone(obj) {
    for (let i = 0; i < obj.skeleton.length; ++i) {
        obj.matrixBones[i] = obj.skeleton[i].m;
    }
}
