import * as THREE from 'three';

export enum BoneType {
    ROTATION = 0,
    TRANSLATION = 1
}

export interface Bone {
    boneIndex: number;
    type: BoneType;
    parent: number;
    vertex: THREE.Vector3;
    pos: THREE.Vector3;
    quat: THREE.Quaternion;
    p: THREE.Vector3;
    r: THREE.Vector4;
    m: THREE.Matrix4;
    children: number[];
}

export interface BoneframeCanFall {
    boneframe: BoneFrame;
    canFall: boolean;
}

export interface BoneFrame {
    type: BoneType;
    quat: THREE.Quaternion;
    pos: THREE.Vector3;
}

export interface KeyFrame {
    duration: number;
    step: THREE.Vector3;
    canFall: boolean;
    boneframes: BoneFrame[];
}

export interface Anim {
    index: number; // realIndex
    numKeyframes: number;
    numBoneframes: number;
    loopFrame: number;
    unk1: number;
    buffer: ArrayBuffer;
    keyframes: KeyFrame[];
}

export interface BoneBindings {
    position: THREE.Vector3[];
    rotation: THREE.Vector4[];
    matrix: THREE.Matrix4[];
}

export interface AnimStateJSON {
    interpolating: boolean;
    hasEnded: boolean;
    wentThroughLastFrame: boolean;
    step: number[];
    rotation: number[];
    animIndex: number;
    currentFrame: number;
    loopFrame: number;
    currentTime: number;
    keyframeChanged: boolean;
}
