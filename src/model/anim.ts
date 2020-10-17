import * as THREE from 'three';

export interface BoneframeCanFall {
    boneframe: Boneframe;
    canFall: boolean;
}

export interface Boneframe {
    type: number;
    veuler: THREE.Vector3;
    pos: THREE.Vector3;
}

export interface Keyframe {
    length: number;
    x: number;
    y: number;
    z: number;
    canFall: boolean;
    boneframes: Boneframe[];
}

export interface Anim {
    index: number; // realIndex
    numKeyframes: number;
    numBoneframes: number;
    loopFrame: number;
    unk1: number;
    buffer: ArrayBuffer;
    keyframes: Keyframe[];
}
