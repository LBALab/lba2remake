// @flow

import {switchStats} from '../renderer/stats';
import {BehaviourMode} from '../game/loop/hero';

export function makeKeyboardControls(params: Object, canvas: Object, sceneManager: Object, game: Object) {
    const onKeyDown = keyDownHandler.bind(null, params, game, sceneManager);
    const onKeyUp = keyUpHandler.bind(null, game);
    canvas.addEventListener('keydown', onKeyDown, true);
    canvas.addEventListener('keyup', onKeyUp, true);
    return {
        dispose: () => {
            canvas.removeEventListener('keydown', onKeyDown);
            canvas.removeEventListener('keyup', onKeyUp);
        }
    }
}

function keyDownHandler(params, game, sceneManager, event) {
    const key = event.code || event.which || event.keyCode;
    switch (key) {
        case 38: // up
        case 'ArrowUp':
            game.controlsState.heroSpeed = 1;
            break;
        case 40: // down
        case 'ArrowDown':
            game.controlsState.heroSpeed = -1;
            break;
        case 37: // left
        case 'ArrowLeft':
            game.controlsState.heroRotationSpeed = 1;
            break;
        case 39: // right
        case 'ArrowRight':
            game.controlsState.heroRotationSpeed = -1;
            break;

        case 49:
        case 'Digit1':
            game.getState().hero.behaviour = BehaviourMode.NORMAL;
            break;
        case 50:
        case 'Digit2':
            game.getState().hero.behaviour = BehaviourMode.ATHLETIC;
            break;
        case 51:
        case 'Digit3':
            game.getState().hero.behaviour = BehaviourMode.AGGRESSIVE;
            break;
        case 52:
        case 'Digit4':
            game.getState().hero.behaviour = BehaviourMode.DISCRETE;
            break;
        case 32:
        case 'Space':
            if (game.getState().hero.behaviour === 1) {
                game.controlsState.jump = 1;
            }
            break;

        case 90:
        case 'KeyZ':
            game.controlsState.action = 1;
            break;
        case 88:
        case 'KeyX':
            game.controlsState.sideStep = 1;
            break;

        case 87: // w
        case 'KeyW':
            game.controlsState.cameraSpeed.z = -1;
            break;
        case 83: // s
        case 'KeyS':
            game.controlsState.cameraSpeed.z = 1;
            break;
        case 65: // a
        case 'KeyA':
            game.controlsState.cameraSpeed.x = -1;
            break;
        case 68: // d
        case 'KeyD':
            game.controlsState.cameraSpeed.x = 1;
            break;

        case 34: // pagedown
        case 'PageDown':
            sceneManager.next();
            break;
        case 33: // pageup
        case 'PageUp':
            sceneManager.previous();
            break;

        case 70: // f
        case 'KeyF':
            switchStats();
            break;
        case 67: // c
        case 'KeyC':
            if (params.editor) {
                game.controlsState.freeCamera = !game.controlsState.freeCamera;
                console.log('Free camera: ', game.controlsState.freeCamera);
            }
            break;
        case 80: // p
        case 'KeyP':
            game.pause();
            break;
        case 71: // g
        case 'KeyG':
            //switchHUD();
            break;
    }
}

function keyUpHandler(game, event) {
    const key = event.code || event.which || event.keyCode;
    switch (key) {
        case 38: // up
        case 'ArrowUp':
            if (game.controlsState.heroSpeed === 1)
                game.controlsState.heroSpeed = 0;
            break;
        case 40: // down
        case 'ArrowDown':
            if (game.controlsState.heroSpeed === -1)
                game.controlsState.heroSpeed = 0;
            break;
        case 37: // left
        case 'ArrowLeft':
            if (game.controlsState.heroRotationSpeed === 1)
                game.controlsState.heroRotationSpeed = 0;
            break;
        case 39: // right
        case 'ArrowRight':
            if (game.controlsState.heroRotationSpeed === -1)
                game.controlsState.heroRotationSpeed = 0;
            break;
        case 32:
        case 'Space':
            game.controlsState.jump = 0;
            break;

        case 90:
        case 'KeyZ':
            game.controlsState.action = 0;
            break;
        case 88:
        case 'KeyX':
            game.controlsState.sideStep = 0;
            break;

        case 87: // w
        case 'KeyW':
            if (game.controlsState.cameraSpeed.z === -1)
                game.controlsState.cameraSpeed.z = 0;
            break;
        case 83: // s
        case 'KeyS':
            if (game.controlsState.cameraSpeed.z === 1)
                game.controlsState.cameraSpeed.z = 0;
            break;
        case 65: // a
        case 'KeyA':
            if (game.controlsState.cameraSpeed.x === -1)
                game.controlsState.cameraSpeed.x = 0;
            break;
        case 68: // d
        case 'KeyD':
            if (game.controlsState.cameraSpeed.x === 1)
                game.controlsState.cameraSpeed.x = 0;
            break;
    }
}
