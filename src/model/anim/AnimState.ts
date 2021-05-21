import { Time } from '../../datatypes';
import { getAnimationsSync } from '../../resources';
import { KeyFrame, Anim, AnimStateJSON, BoneBindings } from './types';
import { ResourceName, getResource } from '../../resources/load';
import Skeleton from './Skeleton';
import Pose from './Pose';

export default class AnimState {
    callback: Function;
    private pose: Pose;
    private interpolating: boolean;
    private savedPose = new Pose();
    private _hasEnded: boolean = false;
    private anim: Anim;
    private _currentFrame: number;
    private _keyframeChanged: boolean;
    private loopFrame: number;
    private currentTime: number;
    readonly kfs: KeyFrame[] = [null, null];

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
            if (this.currentTime > this.kfs[0].duration) {
                this.currentTime = 0;
                this.interpolating = false;
            } else {
                this.pose.setFromBasePoseAndKeyframe(this.savedPose, this.kfs[0], this.currentTime);
            }
        }
        if (!this.interpolating) {
            this.updateKeyFrames();
            this.pose.setFromKeyFrames(this.kfs, this.currentTime);
        }
        this.pose.skeleton.updateHierarchy();
    }

    private setAnim(anim: Anim) {
        this.anim = anim;
        this._currentFrame = 0;
        this.loopFrame = anim ? anim.loopFrame : -1;
        this.currentTime = 0;
        this.kfs[0] = anim.keyframes[0];
        this.kfs[1] = null;
        this._keyframeChanged = false;
    }

    private updateKeyFrames() {
        this.kfs[0] = this.anim.keyframes[this.currentFrame];
        if (!this.kfs[0])
            return;

        this._keyframeChanged = false;
        if (this.currentTime > this.kfs[0].duration) {
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
            }
            this.kfs[0] = this.anim.keyframes[this._currentFrame];
        }

        let nextFrame = this._currentFrame + 1;
        if (nextFrame >= this.anim.numKeyframes) {
            nextFrame = this.loopFrame;
            if (nextFrame >= this.anim.numKeyframes - 1) {
                nextFrame = 0;
            }
        }
        if (this._keyframeChanged && (nextFrame === this.loopFrame || nextFrame === 0)) {
            this.notifyAnimEnd();
        }
        this.kfs[1] = this.anim.keyframes[nextFrame];
    }

    private notifyAnimEnd() {
        this._hasEnded = true;
        if (this.callback) {
            this.callback();
            this.callback = null;
        }
    }

    toJSON(): AnimStateJSON {
        return {
            interpolating: this.interpolating,
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
