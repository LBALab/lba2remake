import THREE from 'three';

import {getRotation, getStep} from '../utils/lba';

export function loadAnimState(skeleton, loopFrame) {
    const state = {
        skeleton: skeleton,
        currentFrame: 0,
        loopFrame: loopFrame,
        currentTime:0,
        step: new THREE.Vector3(0, 0, 0)
    };
    state.matrixBones = createShaderBone(state);
    return state;
}

export function createSkeleton(body) {
    let skeleton = [];
    for (let i = 0; i < body.bonesSize; ++i) {
        const bone = body.bones[i];
        const boneVertex = body.vertices[bone.vertex];

        let skeletonBone = {
            boneIndex: i,
            parent: bone.parent,
            vertex: new THREE.Vector3(boneVertex.x, boneVertex.y, boneVertex.z),
            pos: new THREE.Vector3(0, 0, 0),
            m: new THREE.Matrix4(),
            type: 1, // translation by default
            euler: null,
            children: []
        };

        skeleton.push(skeletonBone);
    }

    for (let i = 0; i < skeleton.length; ++i) {
        const bone = skeleton[i];
        if (bone.parent == 0xFFFF) {
            continue;
        }
        const s = skeleton[bone.parent];
        s.children.push(bone);
    }

    updateSkeletonHierarchy(skeleton, 0);

    return skeleton;
}

function createShaderBone(state) {
    let bones = [];
    for (let i = 0; i < state.skeleton.length; ++i) {
        bones.push(state.skeleton[i].m);
    }
    for (let i = 0; i < 50 - state.skeleton.length; ++i) {
        bones.push(new THREE.Matrix4());
    }
    return bones;
}

function updateShaderBone(state) {
    for (let i = 0; i < state.skeleton.length; ++i) {
        state.matrixBones[i] = state.skeleton[i].m;
    }
}

export function updateKeyframe(anim, state, time) {
    if (!state) return;

    state.currentTime += time.delta * 1000;
    let keyframe = anim.keyframes[state.currentFrame];

    if (!keyframe) return;

    if (state.currentTime > keyframe.length) {
        state.currentTime = 0;
        ++state.currentFrame;
        if (state.currentFrame >= anim.numKeyframes) {
            state.currentFrame = state.loopFrame;
            if (state.currentFrame >= anim.numKeyframes - 1) {
                state.currentFrame = 0;
            }
        }
        keyframe = anim.keyframes[state.currentFrame];
    }

    let nextFrame = state.currentFrame + 1;
    if (nextFrame >= anim.numKeyframes) {
        nextFrame = state.loopFrame;
        if (nextFrame >= anim.numKeyframes - 1) {
            nextFrame = 0;
        }
    }
    const nextkeyframe = anim.keyframes[nextFrame];

    let numBones = anim.numBoneframes;
    if (state.skeleton.length < numBones) {
        numBones = state.skeleton.length;
    }

    updateSkeletonAtKeyframe(state, keyframe, nextkeyframe, numBones);
    updateShaderBone(state);
}

function updateSkeletonAtKeyframe(state, keyframe, nextkeyframe, numBones) {
    const interpolation = state.currentTime / keyframe.length; 
    for (let i = 0; i < numBones; ++i) {
        const s = state.skeleton[i];
        const bf = keyframe.boneframes[i];
        const nbf = nextkeyframe.boneframes[i];
        s.type = bf.type;

        if (s.parent == 0xFFFF) {
            continue;
        }

        if (bf.type == 0) { // rotation
            let eulerX = getRotation(nbf.veuler.x, bf.veuler.x, interpolation);
            let eulerY = getRotation(nbf.veuler.y, bf.veuler.y, interpolation);
            let eulerZ = getRotation(nbf.veuler.z, bf.veuler.z, interpolation);
            s.euler = new THREE.Vector3(eulerX, eulerY, eulerZ);
        } else { // translation
            s.pos.x = bf.pos.x + (nbf.pos.x - bf.pos.x) * interpolation;
            s.pos.y = bf.pos.y + (nbf.pos.y - bf.pos.y) * interpolation;
            s.pos.z = bf.pos.z + (nbf.pos.z - bf.pos.z) * interpolation;
        }
    }
    
    // step translation
    state.step.x = getStep(nextkeyframe.x, keyframe.x, interpolation);
    state.step.y = getStep(nextkeyframe.y, keyframe.y, interpolation);
    state.step.z = getStep(nextkeyframe.z, keyframe.z, interpolation);

    updateSkeletonHierarchy(state.skeleton, 0);
}

function updateSkeletonHierarchy(skeleton, index) {
    const s = skeleton[index];
    const p = skeleton[index == 0 ? 0 : s.parent];
    if (s.parent != 0xFFFF) { // skip root
        s.m.identity();
        const pos = s.vertex.clone();

        if (s.type == 0) { // rotation
            s.m.makeRotationFromEuler(new THREE.Euler(THREE.Math.degToRad(s.euler.x), 
                                                      THREE.Math.degToRad(s.euler.y), 
                                                      THREE.Math.degToRad(s.euler.z), 'XZY'));
        } else { // translation
            pos.x += s.pos.x;
            pos.y += s.pos.y;
            pos.z += s.pos.z; 
        }

        s.m.setPosition(pos);

        const m = p.m.clone();
        m.multiply(s.m);
        s.m.copy(m);
    } else {
        p.m.identity();
    }
    for (let i = 0; i < s.children.length; ++i) {
        updateSkeletonHierarchy(skeleton, s.children[i].boneIndex);
    }
}
