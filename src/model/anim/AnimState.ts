import { Time } from '../../datatypes';
import { getAnimationsSync } from '../../resources';
import { KeyFrame, Anim, AnimStateJSON, BoneBindings } from './types';
import { ResourceName, getResource } from '../../resources/load';
import Skeleton from './Skeleton';
import Pose from './Pose';

/**
 * Holds all the functions and state variables required
 * to perform skeletal animation on a 3D model (body).
 */
export default class AnimState {
    onAnimEnd: Function;
    private pose: Pose;
    private interpolating: boolean;
    private savedPose = new Pose();
    private anim: Anim;
    private loopFrame: number;
    private currentTime: number;
    private bodyIndex: number = -1;
    private wentThroughLastFrame: boolean = false;
    private _hasEnded: boolean = false;
    private _currentFrame: number;
    private _keyframeChanged: boolean;
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

    /**
     * Creates a skeleton for animation, based on the body that we want to animate.
     * @returns Bindings to a list of bones, to be consumed
     * by the vertex shader of the 3D model we want to animate.
     */
    attachBody(body): BoneBindings {
        if (this.bodyIndex !== body.index) {
            const skeleton = Skeleton.fromBody(body);
            this.pose = new Pose(skeleton);
            this.bodyIndex = body.index;
        }
        return this.pose.skeleton.createBindings();
    }

    update(time: Time, entityIdx: number, animIdx: number) {
        const anim: Anim = getAnimationsSync(animIdx, entityIdx);

        // Check if we switched to another anim
        if (!this.anim || anim.index !== this.anim.index) {
            if (this.anim) {
                this.interpolating = true;
                this.savedPose.copy(this.pose);
            }
            this.setAnim(anim);
        }

        this._hasEnded = false;
        this.currentTime += time.delta * 1000;

        // Interpolate between anims
        if (this.interpolating) {
            if (this.currentTime > this.kfs[0].duration) {
                this.currentTime = 0;
                this.interpolating = false;
            } else {
                this.pose.setFromBasePoseAndKeyframe(this.savedPose, this.kfs[0], this.currentTime);
            }
        }
        // Regular anim update
        if (!this.interpolating) {
            this.updateKeyFrames();
            this.pose.setFromKeyFrames(this.kfs, this.currentTime);
        }
        this.pose.skeleton.updateHierarchy();
        if (this._hasEnded && this.onAnimEnd) {
            this.onAnimEnd();
            this.onAnimEnd = null;
        }
    }

    /**
     * This selects a new animation,
     * resetting the anim state.
     */
    private setAnim(anim: Anim) {
        this.anim = anim;
        this._currentFrame = 0;
        this.loopFrame = anim ? anim.loopFrame : -1;
        this.currentTime = 0;
        this.kfs[0] = anim.keyframes[0];
        this.kfs[1] = null;
        this._keyframeChanged = false;
        this.wentThroughLastFrame = false;
    }

    /**
     * This selects the pair of keyframes we want
     * to use for interpolation. This is a function of
     * the length of the currently active keyframe,
     * current time, and anim loop frame.
     */
    private updateKeyFrames() {
        this.kfs[0] = this.anim.keyframes[this.currentFrame];
        if (!this.kfs[0])
            return;

        this._keyframeChanged = false;

        // Select the keyframe to interpolate *from* (kfs[0])
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

        // Select the keyframe to interpolate *to* (kfs[1])
        let nextFrame = this._currentFrame + 1;
        if (nextFrame >= this.anim.numKeyframes) {
            nextFrame = this.loopFrame;
            if (nextFrame >= this.anim.numKeyframes - 1) {
                nextFrame = 0;
            }
        }
        this.kfs[1] = this.anim.keyframes[nextFrame];

        // Check if we reached the last keyframe yet.
        // This is not the same thing as reaching the end of the anim.
        // For reaching the end of the anim, we still have to interpolate
        // between the one but last keyframe and the last keyframe.
        if (nextFrame === this.anim.numKeyframes - 1) {
            this.wentThroughLastFrame = true;
        }

        // Check if anim has ended.
        if (this._keyframeChanged
            && ((this.wentThroughLastFrame && nextFrame === this.loopFrame)
                || nextFrame === 0)) {
            this._hasEnded = true;
        }
    }

    toJSON(): AnimStateJSON {
        return {
            interpolating: this.interpolating,
            hasEnded: this._hasEnded,
            wentThroughLastFrame: this.wentThroughLastFrame,
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
        this.wentThroughLastFrame = data.wentThroughLastFrame;
        this.pose.step.fromArray(data.step);
        this.pose.rotation.fromArray(data.rotation);
        this.anim = getResource(ResourceName.ANIM, data.animIndex);
        this._currentFrame = data.currentFrame;
        this.loopFrame = data.loopFrame;
        this.currentTime = data.currentTime;
        this._keyframeChanged = data.keyframeChanged;
    }
}
