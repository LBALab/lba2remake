import THREE from 'three';
import {GameEvents} from '../game/events';

export default class VRInputHandler {
    constructor(target) {
        this._target = target;
        this._dpad = {x: 0.0, y: 0.0};
        this._screenOrientation = 0;
        this._deviceOrientation = {alpha: 0, beta: 0, gamma: 0};

        window.addEventListener('dpadvaluechanged', this._onDpadValueChanged.bind(this), false);
        window.addEventListener('gamepadbuttonpressed', this._onButtonPressed.bind(this), false);
        window.addEventListener('orientationchange', this._onOrientationChange.bind(this), false);
        window.addEventListener('deviceorientation', this._onDeviceOrientation.bind(this), false);
    }

    _onButtonPressed({details: {name, isPressed}}) {
        if (isPressed) {
            switch (name) {
                case 'leftShoulder':
                    //this._target.rotateBody(PI_2);
                    break;
                case 'rightShoulder':
                    //this._target.rotateBody(-PI_2);
                    break;
                case 'buttonB':
                    this._controller.dispatchEvent(new RequestIslandChange(RequestIslandChange.PREVIOUS));
                    break;
                case 'buttonX':
                    this._controller.dispatchEvent(new RequestIslandChange(RequestIslandChange.NEXT));
                    break;
                case 'buttonY':
                    // center camera
                    break;
                case 'leftTrigger':
                    // switch stats
                    break;
                case 'rightTrigger':
                    // change stats mode
                    break;
            }
        }
    }

    _onDpadValueChanged({details}) {
        this._dpad = details;
    }

    _onOrientationChange() {
        this._screenOrientation = window.orientation || 0;
    };

    _onDeviceOrientation(event) {
        this._deviceOrientation = event;
    }

    update(dt) {
        const alpha = THREE.Math.degToRad(this._deviceOrientation.alpha);
        const beta = THREE.Math.degToRad(this._deviceOrientation.beta);
        const gamma = THREE.Math.degToRad(this._deviceOrientation.gamma);
        const orient = THREE.Math.degToRad(this._screenOrientation);

        this._target.setHeadOrientation(quaternionFromABGO(alpha, beta, gamma, orient));

        if (this._dpad.y != 0) {
            this._target.moveBody(this._dpad.y * 0.75 * dt, 0.0);
        }
        if (this._dpad.x != 0) {
            this._target.rotateBody(this._dpad.x * 0.5 * dt);
        }
    }
}

const quaternionFromABGO = function() {
    const zee = new THREE.Vector3(0, 0, 1);
    const euler = new THREE.Euler();
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    const quaternion = new THREE.Quaternion();

    return function(alpha, beta, gamma, orient) {
        euler.set(beta, alpha, - gamma, 'YXZ');
        quaternion.setFromEuler(euler);
        quaternion.multiply(q1);
        quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
        return quaternion;
    }
}();
