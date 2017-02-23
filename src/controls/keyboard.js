// @flow

import {savePosition, loadPosition} from '../game/hero';
import {switchStats} from '../renderer/stats';

export function makeKeyboardControls(game: any) {
    const onKeyDown = keyDownHandler.bind(null, game);
    const onKeyUp = keyUpHandler.bind(null, game);
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);
    return {
        dispose: () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        }
    }
}

function keyDownHandler(game, event) {
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
            game.getState().hero.behaviour = 0;
            break;
        case 50:
        case 'Digit2':
            game.getState().hero.behaviour = 1;
            break;
        case 51:
        case 'Digit3':
            game.getState().hero.behaviour = 2;
            break;
        case 52:
        case 'Digit4':
            game.getState().hero.behaviour = 3;
            break;

        case 90:
        case 'KeyZ':
            game.controlsState.action = 1;
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
            game.getSceneManager().next();
            break;
        case 33: // pageup
        case 'PageUp':
            game.getSceneManager().previous();
            break;

        case 219:
        case 'BracketLeft':
            savePosition(game);
            break;
        case 221:
        case 'BracketRight':
            loadPosition(game);
            break;

        case 70: // f
        case 'KeyF':
            switchStats();
            break;
        case 67: // c
        case 'KeyC':
            game.controlsState.freeCamera = !game.controlsState.freeCamera;
            console.log('Free camera: ', game.controlsState.freeCamera);
            break;
        case 80: // p
        case 'KeyP':
            game.pause();
            break;
    }
}

function keyUpHandler(game, event) {
    const key = event.code || event.which || event.keyCode;
    switch (key) {
        case 38: // up
        case 'ArrowUp':
            if (game.controlsState.heroSpeed == 1)
                game.controlsState.heroSpeed = 0;
            break;
        case 40: // down
        case 'ArrowDown':
            if (game.controlsState.heroSpeed == -1)
                game.controlsState.heroSpeed = 0;
            break;
        case 37: // left
        case 'ArrowLeft':
            if (game.controlsState.heroRotationSpeed == 1)
                game.controlsState.heroRotationSpeed = 0;
            break;
        case 39: // right
        case 'ArrowRight':
            if (game.controlsState.heroRotationSpeed == -1)
                game.controlsState.heroRotationSpeed = 0;
            break;

        case 90:
        case 'KeyZ':
            game.controlsState.action = 0;
            break;

        case 87: // w
        case 'KeyW':
            if (game.controlsState.cameraSpeed.z == -1)
                game.controlsState.cameraSpeed.z = 0;
            break;
        case 83: // s
        case 'KeyS':
            if (game.controlsState.cameraSpeed.z == 1)
                game.controlsState.cameraSpeed.z = 0;
            break;
        case 65: // a
        case 'KeyA':
            if (game.controlsState.cameraSpeed.x == -1)
                game.controlsState.cameraSpeed.x = 0;
            break;
        case 68: // d
        case 'KeyD':
            if (game.controlsState.cameraSpeed.x == 1)
                game.controlsState.cameraSpeed.x = 0;
            break;
    }
}
