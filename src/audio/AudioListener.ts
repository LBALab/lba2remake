// from ThreeJS: https://github.com/mrdoob/three.js/blob/master/src/audio/AudioListener.js
// This has been brought here to reuse our engine Audio Context instead of creating a new one
import { Vector3, Quaternion, Object3D, Clock } from 'three';

export default class AudioListener extends Object3D {
    readonly context: AudioContext;
    readonly type: string;
    readonly gain: GainNode;

    private _position = new Vector3();
    private _quaternion = new Quaternion();
    private _scale = new Vector3();
    private _orientation = new Vector3();
    private _clock = null;
    private _filter: any;
    private _timeDelta: number;

    constructor(context: AudioContext) {
        super();
        this._clock = new Clock();
        this._filter = null;
        this.type = 'AudioListener';

        this.context = context;
        this.gain = context.createGain();
        this.gain.connect(context.destination);
        this._timeDelta = 0;
    }

    getInput() {
        return this.gain;
    }

    removeFilter() {
        if (this._filter !== null) {
            this.gain.disconnect(this._filter);
            this._filter.disconnect(this.context.destination);
            this.gain.connect(this.context.destination);
            this._filter = null;
        }
        return this;
    }

    getFilter() {
        return this._filter;
    }

    setFilter(value) {
        if (this._filter !== null) {
            this.gain.disconnect(this._filter);
            this._filter.disconnect(this.context.destination);
        } else {
            this.gain.disconnect(this.context.destination);
        }

        this._filter = value;
        this.gain.connect(this._filter);
        this._filter.connect(this.context.destination);

        return this;
    }

    getMasterVolume() {
        return this.gain.gain.value;
    }

    setMasterVolume(value) {
        this.gain.gain.setTargetAtTime(value, this.context.currentTime, 0.01);
        return this;
    }

    updateMatrixWorld(force) {
        super.updateMatrixWorld(force);

        const listener = this.context.listener;
        const up = this.up;

        this._timeDelta = this._clock.getDelta();
        this.matrixWorld.decompose(this._position, this._quaternion, this._scale);
        this._orientation.set(0, 0, - 1).applyQuaternion(this._quaternion);

        if (listener.positionX) {
            const endTime = this.context.currentTime + this._timeDelta;
            listener.positionX.linearRampToValueAtTime(this._position.x, endTime);
            listener.positionY.linearRampToValueAtTime(this._position.y, endTime);
            listener.positionZ.linearRampToValueAtTime(this._position.z, endTime);
            listener.forwardX.linearRampToValueAtTime(this._orientation.x, endTime);
            listener.forwardY.linearRampToValueAtTime(this._orientation.y, endTime);
            listener.forwardZ.linearRampToValueAtTime(this._orientation.z, endTime);
            listener.upX.linearRampToValueAtTime(up.x, endTime);
            listener.upY.linearRampToValueAtTime(up.y, endTime);
            listener.upZ.linearRampToValueAtTime(up.z, endTime);
        } else {
            listener.setPosition(this._position.x, this._position.y, this._position.z);
            listener.setOrientation(
                this._orientation.x, this._orientation.y, this._orientation.z, up.x, up.y, up.z
            );
        }
    }
}
