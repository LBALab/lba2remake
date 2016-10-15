import THREE from 'three';
import {GameEvents} from '../game/events';
import {switchMovementMode} from '../game/hero';
import {switchStats} from '../renderer/stats';

const euler = new THREE.Euler();
const PI_4 = Math.PI / 4;
const MAX_X_ANGLE = Math.PI;// / 2.5;

export function makeGamepadControls(heroPhysics) {
    const onDpadValueChanged = dpadValueChangeHandler.bind(null, heroPhysics);
    const onButtonPressed = buttonPressedHandler.bind(null, heroPhysics);
    window.addEventListener('dpadvaluechanged', onDpadValueChanged, false);
    window.addEventListener('gamepadbuttonpressed', onButtonPressed, false);
    return {
        dispose: () => {
            window.removeEventListener('dpadvaluechanged', onDpadValueChanged);
            window.removeEventListener('gamepadbuttonpressed', onButtonPressed);
        }
    }
}

function dpadValueChangeHandler(heroPhysics, {detail: {x, y, name}}) {
    if (name == 'rightStick') {
        heroFPSControl(heroPhysics, x, y);
    } else {
        heroPhysics.speed.z = -y * 0.45;
    }
}

function buttonPressedHandler(heroPhysics, {detail: {name, isPressed}}) {
    if (isPressed) {
        switch (name) {
            case 'leftShoulder':
                rotateArroundY(heroPhysics.orientation, PI_4);
                break;
            case 'rightShoulder':
                rotateArroundY(heroPhysics.orientation, -PI_4);
                break;
            case 'buttonB':
                GameEvents.scene.nextIsland();
                break;
            case 'buttonX':
                GameEvents.scene.previousIsland();
                break;
            case 'buttonY':
                switchMovementMode(heroPhysics);
                break;
            case 'leftTrigger':
                switchStats();
                break;
        }
    }
}

function rotateArroundY(q, angle) {
    euler.setFromQuaternion(q, 'YXZ');
    euler.y = euler.y + angle;
    q.setFromEuler(euler);
}

function heroFPSControl(heroPhysics, movementX, movementY) {
    euler.setFromQuaternion(heroPhysics.headOrientation, 'YXZ');
    euler.y = 0;
    euler.x = Math.min(Math.max(euler.x - movementY * 0.03, -MAX_X_ANGLE), MAX_X_ANGLE);
    heroPhysics.headOrientation.setFromEuler(euler);

    euler.setFromQuaternion(heroPhysics.orientation, 'YXZ');
    euler.x = 0;
    euler.y = euler.y - movementX * 0.03;
    heroPhysics.orientation.setFromEuler(euler);
}
