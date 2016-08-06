import THREE from 'three';
import {GameEvents} from '../game/events';

export default class DesktopInputHandler {
    constructor(gameStateController) {
        this._controller = gameStateController;
        this._lockedIn = false;
        this._orientation = {x: 0.0, y: 0.0};
        this._arrows = {x: 0, y: 0};

        document.addEventListener('mousemove', this._onMouseMove.bind(this), false );
        window.addEventListener('keydown', this._onKeyDown.bind(this), false);
        window.addEventListener('keyup', this._onKeyUp.bind(this), false);

        this._setupPointerLock(this._controller.domElement);
    }

    update(dt) {

    }

    _onMouseMove(event) {
        if (this._lockedIn) {
            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            this._orientation.y -= movementX * 0.002;
            this._orientation.x -= movementY * 0.002;
            this._target.setHeadRotation(quaternionFromXY(this._orientation.x, this._orientation.y));
        }
    }

    _onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this._arrows.y = -1;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this._arrows.y = 1;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this._arrows.x = -1;
                break;
            case 'KeyD':
            case 'ArrowRigth':
                this._arrows.x = 1;
                break;
            case 'PageDown':
                GameEvents.Scene.NextIsland.trigger();
                break;
            case 'PageUp':
                GameEvents.Scene.PreviousIsland.trigger();
                break;
            case 'KeyF':
                //this.switchStats();
                break;
        }
    }

    _onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
            case 'KeyS':
            case 'ArrowDown':
                this._arrows.y = 0;
                break;
            case 'KeyA':
            case 'ArrowLeft':
            case 'KeyD':
            case 'ArrowRigth':
                this._arrows.x = 0;
                break;
        }
    }

    _setupPointerLock(container) {
        document.addEventListener('pointerlockchange', () => {
            this._lockedIn = document.pointerLockElement == document.body;
        }, false);

        container.addEventListener('click', function() {
            document.body.requestPointerLock();
        });
    }
}

const quaternionFromXY = function() {
    const euler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
    const quaternion = new THREE.Quaternion();

    return function(x, y) {
        euler.set(x, y, 'YXZ');
        quaternion.setFromEuler(euler);
        return quaternion;
    }
}();