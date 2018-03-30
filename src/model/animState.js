import * as THREE from 'three';

import {getRotation, getStep} from '../utils/lba';

export function loadAnimState() {
    return {
        skeleton: null,
        bones: {
            rotation: null,
            position: null,
            matrix: null
        },
        matrixRotation: new THREE.Matrix4(),
        currentFrame: 0,
        loopFrame: 0,
        currentTime: 0,
        isPlaying: true,
        isWaiting: false,
        hasEnded: false,
        step: new THREE.Vector3(0, 0, 0),
        keyframeLength: 0,
        floorSound: -1,
        realAnimIdx: -1,
        prevRealAnimIdx: -1,
        currentKeyframe: null,
        keyframeChanged: false
    };
}

export function resetAnimState(state) {
    state.currentFrame = 0;
    state.loopFrame = 0;
    state.currentTime = 0;
    state.isPlaying = true;
    state.isWaiting = false;
    state.hasEnded = false;
    state.keyframeChanged = false;
    state.step.set(0, 0, 0);
    state.keyframeLength = 0;
    state.floorSound = -1;
}

export function initSkeleton(state, skeleton, loopFrame) {
    state.skeleton = skeleton;
    state.loopFrame = loopFrame;
    state.bones = createShaderBone(state);
    return state;
}

export function createSkeleton(body) {
    const skeleton = [];
    for (let i = 0; i < body.bonesSize; i += 1) {
        const bone = body.bones[i];
        const boneVertex = body.vertices[bone.vertex];

        const skeletonBone = {
            boneIndex: i,
            parent: bone.parent,
            vertex: new THREE.Vector3(boneVertex.x, boneVertex.y, boneVertex.z),
            pos: new THREE.Vector3(0, 0, 0),
            p: new THREE.Vector3(0, 0, 0),
            r: new THREE.Vector4(0, 0, 0, 0),
            m: new THREE.Matrix4(),
            type: 1, // translation by default
            euler: null,
            children: []
        };

        skeleton.push(skeletonBone);
    }

    for (let i = 0; i < skeleton.length; i += 1) {
        const bone = skeleton[i];
        if (bone.parent === 0xFFFF) {
            continue;
        }
        const s = skeleton[bone.parent];
        s.children.push(bone);
    }

    updateSkeletonHierarchy(skeleton, 0);

    return skeleton;
}

function createShaderBone(state) {
    const bones = {
        position: [],
        rotation: [],
        matrix: []
    };
    for (let i = 0; i < state.skeleton.length; i += 1) {
        bones.position.push(state.skeleton[i].p);
        bones.rotation.push(state.skeleton[i].r);
        bones.matrix.push(state.skeleton[i].m);
    }
    for (let i = 0; i < 30 - state.skeleton.length; i += 1) {
        bones.position.push(new THREE.Vector3(0, 0, 0));
        bones.rotation.push(new THREE.Vector4(0, 0, 0, 0));
        bones.matrix.push(new THREE.Matrix4());
    }
    return bones;
}

export function updateKeyframe(anim, state, time, realAnimIdx) {
    if (!state) return;
    if (!state.isPlaying) return;

    state.prevRealAnimIdx = realAnimIdx;
    state.realAnimIdx = realAnimIdx;

    state.currentTime += time.delta * 1000;

    let keyframe = anim.keyframes[state.currentFrame];

    if (!keyframe) return;
    state.keyframeLength = keyframe.length;

    state.keyframeChanged = false;
    if (state.currentTime > keyframe.length) {
        state.hasEnded = false;
        state.currentTime = 0;
        state.currentFrame += 1;
        if (!state.keyframeChanged) {
            state.keyframeChanged = true;
        }
        if (state.currentFrame >= anim.numKeyframes) {
            state.currentFrame = state.loopFrame;
            if (state.currentFrame >= anim.numKeyframes - 1) {
                state.currentFrame = 0;
            }
            state.hasEnded = true;
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

    state.currentKeyframe = nextkeyframe;
}

export function updateKeyframeInterpolation(anim, state, time, realAnimIdx) {
    if (!state) return;
    if (!state.isPlaying) return;

    state.prevRealAnimIdx = state.realAnimIdx;

    state.currentTime += time.delta * 1000;

    const nextkeyframe = anim.keyframes[state.loopFrame];
    if (!nextkeyframe) return;
    state.keyframeLength = nextkeyframe.length;

    if (state.currentTime > nextkeyframe.length) {
        state.realAnimIdx = realAnimIdx;
        state.prevRealAnimIdx = realAnimIdx;
        state.currentTime = 0;
        state.hasEnded = false;
        state.currentFrame = state.loopFrame;
    }

    let numBones = anim.numBoneframes;
    if (state.skeleton.length < numBones) {
        numBones = state.skeleton.length;
    }

    updateSkeletonAtKeyframe(
        state,
        state.currentKeyframe,
        nextkeyframe,
        numBones,
        nextkeyframe.length
    );
}

function updateSkeletonAtKeyframe(state,
                                  keyframe,
                                  nextkeyframe,
                                  numBones,
                                  length = keyframe.length) {
    const interpolation = state.currentTime / length;
    try {
        for (let i = 0; i < numBones; i += 1) {
            const s = state.skeleton[i];
            const bf = keyframe.boneframes[i];
            const nbf = nextkeyframe.boneframes[i];
            s.type = bf.type;
            if (s.parent === 0xFFFF) {
                continue;
            }
            if (bf.type === 0) { // rotation
                const eulerX = getRotation(nbf.veuler.x, bf.veuler.x, interpolation);
                const eulerY = getRotation(nbf.veuler.y, bf.veuler.y, interpolation);
                const eulerZ = getRotation(nbf.veuler.z, bf.veuler.z, interpolation);
                s.euler = new THREE.Vector3(eulerX, eulerY, eulerZ);
            } else { // translation
                s.pos.x = bf.pos.x + (nbf.pos.x - bf.pos.x) * interpolation;
                s.pos.y = bf.pos.y + (nbf.pos.y - bf.pos.y) * interpolation;
                s.pos.z = bf.pos.z + (nbf.pos.z - bf.pos.z) * interpolation;
            }
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.debug('ANIM: exception on updateSkeletonAtKeyframe', e);
    }

    // step translation
    state.step.x = getStep(nextkeyframe.x, keyframe.x, interpolation);
    state.step.y = getStep(nextkeyframe.y, keyframe.y, interpolation);
    state.step.z = getStep(nextkeyframe.z, keyframe.z, interpolation);

    updateSkeletonHierarchy(state.skeleton, 0);
}

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();

function updateSkeletonHierarchy(skeleton, index) {
    const s = skeleton[index];
    const p = skeleton[index === 0 ? 0 : s.parent];
    if (s.parent !== 0xFFFF) { // skip root
        s.m.identity();
        const pos = s.vertex.clone();

        if (s.type === 0) { // rotation
            s.m.makeRotationFromEuler(new THREE.Euler(THREE.Math.degToRad(s.euler.x),
                THREE.Math.degToRad(s.euler.y),
                THREE.Math.degToRad(s.euler.z), 'XZY'));
        } else { // translation
            pos.x += s.pos.x;
            pos.y += s.pos.y;
            pos.z += s.pos.z;
        }

        s.m.setPosition(pos);

        tmpM.copy(p.m);
        tmpM.multiply(s.m);
        s.m.copy(tmpM);
        tmpQ.setFromRotationMatrix(s.m);
        tmpQ.normalize();
        s.p.setFromMatrixPosition(s.m);
        s.r.set(tmpQ.x, tmpQ.y, tmpQ.z, tmpQ.w);
    } else {
        p.m.identity();
    }
    for (let i = 0; i < s.children.length; i += 1) {
        updateSkeletonHierarchy(skeleton, s.children[i].boneIndex);
    }
}
