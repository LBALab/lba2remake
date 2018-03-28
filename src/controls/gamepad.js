// @flow

import * as THREE from 'three';
import {switchStats} from '../renderer/stats';

const euler = new THREE.Euler();
const PI_4 = Math.PI / 4;
const MAX_X_ANGLE = Math.PI;// / 2.5;

export function makeGamepadControls(sceneManager: Object, game: Object) {
    const onDpadValueChanged = dpadValueChangeHandler.bind(null, game);
    const onButtonPressed = buttonPressedHandler.bind(null, game, sceneManager);
    window.addEventListener('dpadvaluechanged', onDpadValueChanged, false);
    window.addEventListener('gamepadbuttonpressed', onButtonPressed, false);
    return {
        dispose: () => {
            window.removeEventListener('dpadvaluechanged', onDpadValueChanged);
            window.removeEventListener('gamepadbuttonpressed', onButtonPressed);
        }
    };
}

function dpadValueChangeHandler(game, {detail: {x, y, name}}) {
    if (game.controlsState.freeCamera) {
        if (name === 'rightStick') {
            heroFPSControl(game, x, y);
        } else {
            game.controlsState.cameraSpeed.z = -y * 0.45;
        }
    } else {
        game.controlsState.heroSpeed = y >= 0.5 ? 1 : (y <= -0.5 ? -1 : 0);
        game.controlsState.heroRotationSpeed = -x;
    }
}

function buttonPressedHandler(game: Object, sceneManager: Object, {detail: {name, isPressed}}) {
    if (isPressed) {
        switch (name) {
            case 'leftShoulder':
                rotateAroundY(game.controlsState.cameraOrientation, PI_4);
                break;
            case 'rightShoulder':
                rotateAroundY(game.controlsState.cameraOrientation, -PI_4);
                break;
            case 'buttonB':
                sceneManager.next();
                break;
            case 'buttonX':
                sceneManager.previous();
                break;
            case 'buttonY':
                game.controlsState.freeCamera = !game.controlsState.freeCamera;
                // eslint-disable-next-line no-console
                console.log('Free camera: ', game.controlsState.freeCamera);
                break;
            case 'leftTrigger':
                switchStats();
                break;
        }
    }
}

function rotateAroundY(q, angle) {
    euler.setFromQuaternion(q, 'YXZ');
    euler.y += angle;
    q.setFromEuler(euler);
}

function heroFPSControl(game, movementX, movementY) {
    euler.setFromQuaternion(game.controlsState.cameraHeadOrientation, 'YXZ');
    euler.y = 0;
    euler.x = Math.min(Math.max(euler.x - (movementY * 0.03), -MAX_X_ANGLE), MAX_X_ANGLE);
    game.controlsState.cameraHeadOrientation.setFromEuler(euler);

    euler.setFromQuaternion(game.controlsState.cameraOrientation, 'YXZ');
    euler.x = 0;
    euler.y -= movementX * 0.03;
    game.controlsState.cameraOrientation.setFromEuler(euler);
}
