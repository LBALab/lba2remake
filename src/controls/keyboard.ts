import * as THREE from 'three';
import {switchStats} from '../renderer/stats';
import {BehaviourMode} from '../game/loop/hero';
import { SceneManager } from '../game/SceneManager';
import Game from '../game/Game';
import { Params } from '../params';
import Scene from '../game/Scene';
import { ControlActiveType } from '../game/ControlsState';
import Renderer from '../renderer';

export function makeKeyboardControls(params: Params,
                                     elem: HTMLElement,
                                     sceneManager: SceneManager,
                                     game: Game,
                                     renderer: Renderer) {
    const onKeyDown = keyDownHandler.bind(null, params, game, sceneManager, renderer);
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

function keyDownHandler(params, game: Game, sceneManager: SceneManager, renderer: Renderer, event) {
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
    switch (event.code) {
        case 'ArrowUp':
            game.controlsState.up = 1;
            game.controlsState.controlVector.y = 1;
            break;
        case 'ArrowDown':
            game.controlsState.down = 1;
            game.controlsState.controlVector.y = -1;
            game.controlsState.cancelJump = true;
            break;
        case 'ArrowLeft':
            game.controlsState.left = 1;
            game.controlsState.controlVector.x = -1;
            break;
        case 'ArrowRight':
            game.controlsState.right = 1;
            game.controlsState.controlVector.x = 1;
            break;
        case 'Digit1':
            if (!canChangeBehaviour()) {
                break;
            }
            game.getState().hero.behaviour = BehaviourMode.NORMAL;
            break;
        case 'Digit2':
            if (!canChangeBehaviour()) {
                break;
            }
            game.getState().hero.behaviour = BehaviourMode.ATHLETIC;
            break;
        case 'Digit3':
            if (!canChangeBehaviour()) {
                break;
            }
            game.getState().hero.behaviour = BehaviourMode.AGGRESSIVE;
            break;
        case 'Digit4':
            if (!canChangeBehaviour()) {
                break;
            }
            game.getState().hero.behaviour = BehaviourMode.DISCRETE;
            break;
        case 'Digit5':
            if (!canChangeBehaviour()) {
                break;
            }
            game.getState().hero.behaviour = BehaviourMode.PROTOPACK;
            break;
        case 'Digit6':
            if (!canChangeBehaviour()) {
                break;
            }
            game.getState().hero.behaviour = BehaviourMode.JETPACK;
            break;
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
        case 'KeyZ':
            if (!game.controlsState.skipListener) {
                game.controlsState.action = 1;
            }
            break;
        case 'AltLeft':
            game.controlsState.weapon = 1;
            break;
        case 'KeyX':
            game.controlsState.sideStep = 1;
            break;
        case 'KeyW':
            game.controlsState.cameraSpeed.z = 1;
            break;
        case 'KeyS':
            game.controlsState.cameraSpeed.z = -1;
            break;
        case 'KeyA':
            game.controlsState.cameraSpeed.x = 1;
            break;
        case 'KeyD':
            game.controlsState.cameraSpeed.x = -1;
            break;
        case 'KeyR':
            if (!event.ctrlKey && !event.metaKey) {
                renderer.switchResolution();
            }
            break;
        case 'KeyF':
            switchStats();
            break;
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
        case 'KeyP':
            game.togglePause();
            break;
        case 'Enter':
            if (game.controlsState.skipListener) {
                game.controlsState.skipListener();
            }
            break;
        case 'MetaLeft':
        case 'MetaRight':
        case 'ControlLeft':
        case 'ControlRight':
            game.controlsState.control = 1;
            break;
    }
    event.preventDefault();
}

function keyUpHandler(game, event) {
    switch (event.code) {
        case 'ArrowUp':
            game.controlsState.up = 0;
            if (game.controlsState.controlVector.y === 1)
                game.controlsState.controlVector.y = 0;
            break;
        case 'ArrowDown':
            game.controlsState.down = 0;
            game.controlsState.cancelJump = false;
            if (game.controlsState.controlVector.y === -1)
                game.controlsState.controlVector.y = 0;
            break;
        case 'ArrowLeft':
            game.controlsState.left = 0;
            if (game.controlsState.controlVector.x === -1)
                game.controlsState.controlVector.x = 0;
            break;
        case 'ArrowRight':
            game.controlsState.right = 0;
            if (game.controlsState.controlVector.x === 1)
                game.controlsState.controlVector.x = 0;
            break;
        case 'Space':
            game.controlsState.action = 0;
            game.controlsState.jump = 0;
            game.controlsState.fight = 0;
            game.controlsState.crouch = 0;
            break;
        case 'KeyZ':
            game.controlsState.action = 0;
            break;
        case 'AltLeft':
            game.controlsState.weapon = 0;
            break;
        case 'KeyX':
            game.controlsState.sideStep = 0;
            break;
        case 'KeyW':
            if (game.controlsState.cameraSpeed.z === 1)
                game.controlsState.cameraSpeed.z = 0;
            break;
        case 'KeyS':
            if (game.controlsState.cameraSpeed.z === -1)
                game.controlsState.cameraSpeed.z = 0;
            break;
        case 'KeyA':
            if (game.controlsState.cameraSpeed.x === 1)
                game.controlsState.cameraSpeed.x = 0;
            break;
        case 'KeyD':
            if (game.controlsState.cameraSpeed.x === -1)
                game.controlsState.cameraSpeed.x = 0;
            break;
        case 'MetaLeft':
        case 'MetaRight':
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
