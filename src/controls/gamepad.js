// @flow

import THREE from 'three';
import {switchStats} from '../renderer/stats';

const euler = new THREE.Euler();
const PI_4 = Math.PI / 4;
const MAX_X_ANGLE = Math.PI;// / 2.5;

export function makeGamepadControls(game: any) {
    const onDpadValueChanged = dpadValueChangeHandler.bind(null, game);
    const onButtonPressed = buttonPressedHandler.bind(null, game);
    window.addEventListener('dpadvaluechanged', onDpadValueChanged, false);
    window.addEventListener('gamepadbuttonpressed', onButtonPressed, false);
    return {
        dispose: () => {
            window.removeEventListener('dpadvaluechanged', onDpadValueChanged);
            window.removeEventListener('gamepadbuttonpressed', onButtonPressed);
        }
    }
}

function dpadValueChangeHandler(game, {detail: {x, y, name}}) {
    if (name == 'rightStick') {
        heroFPSControl(game, x, y);
    } else {
        game.controlsState.cameraSpeed.z = -y * 0.45;
    }
}

function buttonPressedHandler(game: any, {detail: {name, isPressed}}) {
    if (isPressed) {
        switch (name) {
            case 'leftShoulder':
                rotateArroundY(game.controlsState.cameraOrientation, PI_4);
                break;
            case 'rightShoulder':
                rotateArroundY(game.controlsState.cameraOrientation, -PI_4);
                break;
            case 'buttonB':
                //GameEvents.scene.nextIsland();
                break;
            case 'buttonX':
                //GameEvents.scene.previousIsland();
                break;
            case 'buttonY':
                //switchMovementMode(heroPhysics);
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

function heroFPSControl(game, movementX, movementY) {
    euler.setFromQuaternion(game.controlsState.cameraHeadOrientation, 'YXZ');
    euler.y = 0;
    euler.x = Math.min(Math.max(euler.x - movementY * 0.03, -MAX_X_ANGLE), MAX_X_ANGLE);
    game.controlsState.cameraHeadOrientation.setFromEuler(euler);

    euler.setFromQuaternion(game.controlsState.cameraOrientation, 'YXZ');
    euler.x = 0;
    euler.y = euler.y - movementX * 0.03;
    game.controlsState.cameraOrientation.setFromEuler(euler);
}
