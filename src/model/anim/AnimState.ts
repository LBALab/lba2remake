import * as THREE from 'three';

import { Time } from '../../datatypes';
import { getAnimationsSync } from '../../resources';
import { KeyFrame, Anim, AnimStateJSON, BoneBindings } from './types';
import { ResourceName, getResource } from '../../resources/load';
import Skeleton from './Skeleton';

class Pose {
    readonly skeleton: Skeleton;
    readonly step = new THREE.Vector3();
    readonly rotation = new THREE.Vector3();

    constructor(skeleton = null) {
        this.skeleton = skeleton || Skeleton.makeEmpty();
    }

    copy(other: Pose) {
        this.skeleton.copy(other.skeleton);
        this.step.copy(other.step);
        this.rotation.copy(other.rotation);
    }
}

export default class AnimState {
    noInterpolate: boolean;
    callback: Function;
    floorSound: number;
    floorSound2: number;
    private pose: Pose;
    private interpolating: boolean;
    private savedPose = new Pose();
    private _hasEnded: boolean;
    private anim: Anim;
    private _currentFrame: number;
    private _keyframeChanged: boolean;
    private loopFrame: number;
    private currentTime: number;
    readonly kf: KeyFrame[] = [null, null];

    get hasEnded() {
        return this._hasEnded;
    }

    get currentFrame() {
        return this._currentFrame;
    }

    get keyframeChanged() {
        return this._keyframeChanged;
    }

    get step() {
        return this.pose.step;
    }

    get rotation() {
        return this.pose.rotation;
    }

    constructor() {
        this.reset();
    }

    reset() {
        this._hasEnded = false;
        if (this.pose) {
            this.pose.step.set(0, 0, 0);
            this.pose.rotation.set(0, 0, 0);
        }
        this.floorSound = -1;
        this.floorSound2 = null;
        this.noInterpolate = false;
        if (this.callback) {
            this.callback();
        }
        this.callback = null;
    }

    attachBody(body): BoneBindings {
        const skeleton = Skeleton.fromBody(body);
        this.pose = new Pose(skeleton);
        return this.pose.skeleton.createBindings();
    }

    update(time: Time, entityIdx: number, animIdx: number) {
        const anim: Anim = getAnimationsSync(animIdx, entityIdx);

        if (!this.anim || anim.index !== this.anim.index) {
            if (this.anim) {
                this.interpolating = true;
                this.savedPose.copy(this.pose);
            }
            this.setAnim(anim);
        }

        this._hasEnded = false;
        this.currentTime += time.delta * 1000;

        if (this.interpolating) {
            if (this.currentTime > this.kf[0].duration) {
                this.currentTime = 0;
                this.interpolating = false;
            } else {
                this.updateInterpolation();
            }
        }
        if (!this.interpolating) {
            this.updateKeyFrames();
            this.updatePose();
        }
        this.pose.skeleton.updateHierarchy();
    }

    private setAnim(anim: Anim) {
        this.anim = anim;
        this._currentFrame = 0;
        this.loopFrame = anim ? anim.loopFrame : -1;
        this.currentTime = 0;
        this.kf[0] = anim.keyframes[0];
        this.kf[1] = null;
        this._keyframeChanged = false;
    }

    private updateKeyFrames() {
        this.kf[0] = this.anim.keyframes[this.currentFrame];
        if (this.currentFrame === this.anim.numKeyframes - 1) {
            if (this.callback) {
                // Not sure about this, I suspect the
                // callback is not used as intented here.
                this.callback();
                this.callback = null;
            }
        }

        if (!this.kf[0]) return;

        this._keyframeChanged = false;
        if (this.currentTime > this.kf[0].duration) {
            this.currentTime = 0;
            this._currentFrame += 1;
            if (!this._keyframeChanged) {
                this._keyframeChanged = true;
            }
            if (this._currentFrame >= this.anim.numKeyframes) {
                this._currentFrame = this.loopFrame;
                if (this._currentFrame >= this.anim.numKeyframes - 1) {
                    this._currentFrame = 0;
                }
                this._hasEnded = true;
            }
            this.kf[0] = this.anim.keyframes[this._currentFrame];
        }

        let nextFrame = this._currentFrame + 1;
        if (nextFrame >= this.anim.numKeyframes) {
            nextFrame = this.loopFrame;
            if (nextFrame >= this.anim.numKeyframes - 1) {
                nextFrame = 0;
            }
        }
        this.kf[1] = this.anim.keyframes[nextFrame];
    }

    private updatePose() {
        const { kf, pose } = this;
        const duration = kf[0].duration;
        const alpha = duration > 0
            ? this.currentTime / duration
            : 0;
        const stepFactor = duration > 0
            ? 1000 / duration
            : 0;
        pose.skeleton.lerpKeyFrames(kf[0].boneframes, kf[1].boneframes, alpha);
        const rootA = kf[0].boneframes[0];
        const rootB = kf[1].boneframes[0];
        if (rootA && rootB) {
            pose.rotation.lerpVectors(rootA.pos, rootB.pos, alpha);
            pose.rotation.multiplyScalar(stepFactor);
        }

        pose.step.lerpVectors(kf[0].step, kf[1].step, alpha);
        pose.step.multiplyScalar(stepFactor);
    }

    private _tmpRot = new THREE.Vector3();
    private _tmpPos = new THREE.Vector3();

    private updateInterpolation() {
        const { kf, pose, savedPose } = this;
        const duration = kf[0].duration;
        const alpha = duration > 0
            ? this.currentTime / duration
            : 0;
        const stepFactor = duration > 0
            ? 1000 / duration
            : 0;
        pose.skeleton.lerpSkeletonAndKeyFrame(savedPose.skeleton, kf[0].boneframes, alpha);
        const rootBf = kf[0].boneframes[0];
        if (rootBf) {
            this._tmpRot.copy(rootBf.pos);
            this._tmpRot.multiplyScalar(stepFactor);
            pose.rotation.lerpVectors(savedPose.rotation, this._tmpRot, alpha);
        }

        this._tmpPos.copy(kf[0].step);
        this._tmpPos.multiplyScalar(stepFactor);
        pose.step.lerpVectors(savedPose.step, this._tmpPos, alpha);
    }

    toJSON(): AnimStateJSON {
        return {
            interpolating: this.interpolating,
            noInterpolate: this.noInterpolate,
            hasEnded: this._hasEnded,
            step: this.pose.step.toArray(),
            rotation: this.pose.rotation.toArray(),
            animIndex: this.anim ? this.anim.index : -1,
            currentFrame: this._currentFrame,
            loopFrame: this.loopFrame,
            currentTime: this.currentTime,
            keyframeChanged: this._keyframeChanged,
        };
    }

    setFromJSON(data: AnimStateJSON) {
        this.interpolating = data.interpolating;
        this.noInterpolate = data.noInterpolate;
        this._hasEnded = data.hasEnded;
        this.pose.step.fromArray(data.step);
        this.pose.rotation.fromArray(data.rotation);
        this.anim = getResource(ResourceName.ANIM, data.animIndex);
        this._currentFrame = data.currentFrame;
        this.loopFrame = data.loopFrame;
        this.currentTime = data.currentTime;
        this._keyframeChanged = data.keyframeChanged;
    }
}
