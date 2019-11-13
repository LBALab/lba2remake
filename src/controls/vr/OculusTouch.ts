import THREE from 'three';
import { switchStats } from '../../renderer/stats';
import { getButtonState, getGamepadIndex } from './utils';

const BUTTONS = {
    THUMBSTICK: 0,
    TRIGGER: 1,
    GRIP: 2,
    A: 3,
    X: 3,
    B: 4,
    Y: 4,
    THUMBREST: 5,
};

const controllerBase = {
    trigger: null,
    grip: null
};

const controllers = {
    left: Object.assign({
        enabled: false,
        pad: new THREE.Vector2(),
        buttonX: null,
        buttonY: null,
    }, controllerBase),
    right: Object.assign({
        enabled: false,
        pad: new THREE.Vector2(),
        buttonA: null,
        buttonB: null,
    }, controllerBase)
};

export default class OculusTouch {
    supports(id) {
        return id === 'Oculus Touch (Left)'
            || id === 'Oculus Touch (Right)';
    }

    handleGamepad(gamepad, idx, {game}) {
        const {THUMBSTICK, TRIGGER, GRIP, X, Y, A, B} = BUTTONS;
        const {controlsState} = game;
        const controller = controllers[gamepad.hand];

        controller.enabled = true;
        controller.thumbstick = getButtonState(gamepad, THUMBSTICK);
        controller.trigger = getButtonState(gamepad, TRIGGER);
        controller.grip = getButtonState(gamepad, GRIP);

        if (gamepad.hand === 'left') {
            controller.buttonX = getButtonState(gamepad, X);
            controller.buttonY = getButtonState(gamepad, Y);
        } else {
            controller.buttonA = getButtonState(gamepad, A);
            controller.buttonB = getButtonState(gamepad, B);
        }
        controlsState.ctrlTriggers[getGamepadIndex(gamepad, idx)] = controller.trigger.tapped;
        controller.pad.set(gamepad.axes[0], -gamepad.axes[1]);
    }

    update({sceneManager, game}) {
        const { left, right } = controllers;
        if (!left.enabled || !right.enabled)
            return;

        const {controlsState} = game;
        const scene = sceneManager.getScene();
        const camera = scene && scene.camera;
        const hero = game.getState().hero;

        controlsState.relativeToCam = true;
        controlsState.jump = 0;
        controlsState.weapon = 0;
        controlsState.controllerType = 'oculustouch';

        // Center camera
        if (right.trigger.tapped && camera && scene) {
            camera.center(scene);
        }

        // Skip dialogues
        if (controlsState.skipListener) {
            controlsState.action = 0;
            if (left.buttonX.tapped
                || right.buttonA.tapped
                || right.buttonB.tapped) {
                controlsState.skipListener();
                return;
            }
        }

        if (left.buttonY.tapped) {
            history.back();
            return;
        }

        // Hero movement
        controlsState.controlVector.copy(left.pad);

        // Action button
        controlsState.action = left.buttonX.tapped || right.buttonA.tapped ? 1 : 0;

        if (left.buttonY.longPressed) {
            switchStats();
        }

        hero.behaviour = hero.prevBehaviour;
        if (left.grip.pressed) {
            hero.prevBehaviour = hero.behaviour;
            hero.behaviour = 1;
            controlsState.jump = left.trigger.pressed ? 1 : 0;
        } else {
            controlsState.weapon = left.trigger.pressed ? 1 : 0;
        }
        if (right.buttonB.tapped) {
            hero.behaviour = (hero.behaviour + 1) % 4;
            if (hero.behaviour === 1) { // skip sporty
                hero.behaviour += 1;
            }
            hero.prevBehaviour = hero.behaviour;
        }
    }
}
