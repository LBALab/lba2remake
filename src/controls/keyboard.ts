import * as THREE from 'three';
import {switchStats} from '../renderer/stats';
import {BehaviourMode} from '../game/loop/hero';
import { SceneManager } from '../game/SceneManager';
import Game from '../game/Game';
import { Params } from '../params';
import Scene from '../game/Scene';
import { ControlActiveType } from '../game/ControlsState';

export function makeKeyboardControls(params: Params,
                                     elem: HTMLElement,
                                     sceneManager: SceneManager,
                                     game: Game) {
    const onKeyDown = keyDownHandler.bind(null, params, game, sceneManager);
    const onKeyUp = keyUpHandler.bind(null, game);
    const onFocusOut = focusOutHandler.bind(null, game);
    elem.addEventListener('keydown', onKeyDown, true);
    elem.addEventListener('keyup', onKeyUp, true);
    elem.addEventListener('focusout', onFocusOut, true);
    return {
        type: 'keyboard',
        dispose: () => {
            elem.removeEventListener('keydown', onKeyDown);
            elem.removeEventListener('keyup', onKeyUp);
            elem.removeEventListener('focusout', onFocusOut);
        }
    };
}

function keyDownHandler(params, game: Game, sceneManager: SceneManager, event) {
    const key = event.code || event.which || event.keyCode;
    const { behaviourMenu } = game.getUiState();
    if (behaviourMenu) {
        return;
    }
    // We disallow directly changing Twinsen's behaviour via the number keys if we're in Cinema
    // mode, or if Twinsen is with Zoe.
    const canChangeBehaviour = () => {
        return !game.isCinema() &&
        game.getState().hero.behaviour !== BehaviourMode.ZOE;
    };
    game.controlsState.activeType = ControlActiveType.KEYBOARD;
    // console.log(event.code, event.which, event.keyCode);
    switch (key) {
        case 38: // up
        case 'ArrowUp':
            game.controlsState.up = 1;
            game.controlsState.controlVector.y = 1;
            break;
        case 40: // down
        case 'ArrowDown':
            game.controlsState.down = 1;
            game.controlsState.controlVector.y = -1;
            break;
        case 37: // left
        case 'ArrowLeft':
            game.controlsState.left = 1;
            game.controlsState.controlVector.x = -1;
            break;
        case 39: // right
        case 'ArrowRight':
            game.controlsState.right = 1;
            game.controlsState.controlVector.x = 1;
            break;

        case 49:
        case 'Digit1':
            if (!canChangeBehaviour()) {
                break;
            }
            game.getState().hero.behaviour = BehaviourMode.NORMAL;
            break;
        case 50:
        case 'Digit2':
            if (!canChangeBehaviour()) {
                break;
            }
            game.getState().hero.behaviour = BehaviourMode.ATHLETIC;
            break;
        case 51:
        case 'Digit3':
            if (!canChangeBehaviour()) {
                break;
            }
            game.getState().hero.behaviour = BehaviourMode.AGGRESSIVE;
            break;
        case 52:
        case 'Digit4':
            if (!canChangeBehaviour()) {
                break;
            }
            game.getState().hero.behaviour = BehaviourMode.DISCRETE;
            break;
        case 53:
        case 'Digit5':
            if (!canChangeBehaviour()) {
                break;
            }
            game.getState().hero.behaviour = BehaviourMode.PROTOPACK;
            break;
        case 54:
        case 'Digit6':
            if (!canChangeBehaviour()) {
                break;
            }
            game.getState().hero.behaviour = BehaviourMode.JETPACK;
            break;
        case 32:
        case 'Space':
            switch (game.getState().hero.behaviour) {
                case 0:
                    game.controlsState.action = 1;
                    break;
                case 1:
                    game.controlsState.jump = 1;
                    break;
                case 2:
                    game.controlsState.fight = 1;
                    break;
                case 3:
                    game.controlsState.crouch = 1;
                    break;
            }
            break;
        case 90:
        case 'KeyZ':
            if (!game.controlsState.skipListener) {
                game.controlsState.action = 1;
            }
            break;
        case 18:
        case 'AltLeft':
            game.controlsState.weapon = 1;
            break;
        case 88:
        case 'KeyX':
            game.controlsState.sideStep = 1;
            break;
        case 87: // w
        case 'KeyW':
            game.controlsState.cameraSpeed.z = 1;
            break;
        case 83: // s
        case 'KeyS':
            game.controlsState.cameraSpeed.z = -1;
            break;
        case 65: // a
        case 'KeyA':
            game.controlsState.cameraSpeed.x = 1;
            break;
        case 68: // d
        case 'KeyD':
            game.controlsState.cameraSpeed.x = -1;
            break;

        case 70: // f
        case 'KeyF':
            switchStats();
            break;
        case 67: // c
        case 'KeyC':
            if (params.editor) {
                game.controlsState.freeCamera = !game.controlsState.freeCamera;
                // tslint:disable-next-line:no-console
                console.log('Free camera: ', game.controlsState.freeCamera);
                if (game.controlsState.freeCamera) {
                    const scene = sceneManager.getScene();
                    resetCameraOrientation(game, scene);
                }
            }
            break;
        case 80: // p
        case 'KeyP':
            game.togglePause();
            break;
        case 13:
        case 'Enter':
            if (game.controlsState.skipListener) {
                game.controlsState.skipListener();
            }
            break;

        case 91:
        case 'MetaLeft':
        case 'MetaRight':
        case 17:
        case 'ControlLeft':
        case 'ControlRight':
            game.controlsState.control = 1;
            break;
    }
    event.preventDefault();
}

function keyUpHandler(game, event) {
    const key = event.code || event.which || event.keyCode;
    switch (key) {
        case 38: // up
        case 'ArrowUp':
            game.controlsState.up = 0;
            if (game.controlsState.controlVector.y === 1)
                game.controlsState.controlVector.y = 0;
            break;
        case 40: // down
        case 'ArrowDown':
            game.controlsState.down = 0;
            if (game.controlsState.controlVector.y === -1)
                game.controlsState.controlVector.y = 0;
            break;
        case 37: // left
        case 'ArrowLeft':
            game.controlsState.left = 0;
            if (game.controlsState.controlVector.x === -1)
                game.controlsState.controlVector.x = 0;
            break;
        case 39: // right
        case 'ArrowRight':
            game.controlsState.right = 0;
            if (game.controlsState.controlVector.x === 1)
                game.controlsState.controlVector.x = 0;
            break;
        case 32:
        case 'Space':
            game.controlsState.action = 0;
            game.controlsState.jump = 0;
            game.controlsState.fight = 0;
            game.controlsState.crouch = 0;
            break;

        case 90:
        case 'KeyZ':
            game.controlsState.action = 0;
            break;

        case 18:
        case 'AltLeft':
            game.controlsState.weapon = 0;
            break;

        case 88:
        case 'KeyX':
            game.controlsState.sideStep = 0;
            break;

        case 87: // w
        case 'KeyW':
            if (game.controlsState.cameraSpeed.z === 1)
                game.controlsState.cameraSpeed.z = 0;
            break;
        case 83: // s
        case 'KeyS':
            if (game.controlsState.cameraSpeed.z === -1)
                game.controlsState.cameraSpeed.z = 0;
            break;
        case 65: // a
        case 'KeyA':
            if (game.controlsState.cameraSpeed.x === 1)
                game.controlsState.cameraSpeed.x = 0;
            break;
        case 68: // d
        case 'KeyD':
            if (game.controlsState.cameraSpeed.x === -1)
                game.controlsState.cameraSpeed.x = 0;
            break;

        case 91:
        case 'MetaLeft':
        case 'MetaRight':
        case 17:
        case 'ControlLeft':
        case 'ControlRight':
            game.controlsState.control = 0;
            break;
    }
}

function focusOutHandler(game) {
    game.resetControlsState();
}

export function resetCameraOrientation(game: Game, scene: Scene) {
    if (!scene)
        return;

    const controlNode = scene.camera.controlNode;
    if (!controlNode)
        return;

    const baseEuler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
    const headEuler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
    baseEuler.setFromQuaternion(controlNode.quaternion, 'YXZ');
    headEuler.copy(baseEuler);

    headEuler.y = 0;
    game.controlsState.cameraHeadOrientation.setFromEuler(headEuler);

    baseEuler.x = 0;
    game.controlsState.cameraOrientation.setFromEuler(baseEuler);
}
