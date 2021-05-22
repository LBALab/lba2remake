import * as THREE from 'three';

import { KeyFrame } from './types';
import Skeleton from './Skeleton';

export default class Pose {
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

    setFromKeyFrames(kfs: KeyFrame[], time: number) {
        const duration = kfs[0].duration;
        const alpha = duration > 0 ? time / duration : 0;
        const stepFactor = duration > 0 ? 1000 / duration : 0;
        this.skeleton.lerpKeyFrames(kfs[0].boneframes, kfs[1].boneframes, alpha);
        const rootA = kfs[0].boneframes[0];
        const rootB = kfs[1].boneframes[0];
        if (rootA && rootB) {
            this.rotation.lerpVectors(rootA.pos, rootB.pos, alpha);
            this.rotation.multiplyScalar(stepFactor);
        }

        this.step.lerpVectors(kfs[0].step, kfs[1].step, alpha);
        this.step.multiplyScalar(stepFactor);
    }

    setFromBasePoseAndKeyframe(base: Pose, kf: KeyFrame, time: number) {
        const duration = kf.duration;
        const alpha = duration > 0 ? time / duration : 0;
        const stepFactor = duration > 0 ? 1000 / duration : 0;
        this.skeleton.lerpSkeletonAndKeyFrame(base.skeleton, kf.boneframes, alpha);
        const rootBf = kf.boneframes[0];
        if (rootBf) {
            this._tmpRot.copy(rootBf.pos);
            this._tmpRot.multiplyScalar(stepFactor);
            this.rotation.lerpVectors(base.rotation, this._tmpRot, alpha);
        }

        this._tmpStep.copy(kf.step);
        this._tmpStep.multiplyScalar(stepFactor);
        this.step.lerpVectors(base.step, this._tmpStep, alpha);
    }

    private _tmpRot = new THREE.Vector3();
    private _tmpStep = new THREE.Vector3();
}
