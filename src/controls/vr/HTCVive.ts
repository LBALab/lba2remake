import * as THREE from 'three';
import { switchStats } from '../../renderer/stats';
import { getButtonState } from './buttonState';

const BUTTONS = {
    THUMBPAD: 0,
    TRIGGER: 1,
    GRIP: 2,
    MENU: 3
};

const makeController = () => ({
    enabled: false,
    pad: new THREE.Vector2(),
    thumbpad: null,
    trigger: null,
    grip: null,
    menu: null
});

const controllers = {
    left: makeController(),
    right: makeController()
};

export default class HTCVive {
    supports(id) {
        return id === 'OpenVR Gamepad';
    }

    handleGamepad(gamepad, idx, {game}) {
        const {THUMBPAD, TRIGGER, GRIP, MENU} = BUTTONS;
        const {controlsState} = game;
        const controller = controllers[gamepad.hand];

        controller.enabled = true;
        controller.thumbpad = getButtonState(gamepad, THUMBPAD);
        controller.trigger = getButtonState(gamepad, TRIGGER);
        controller.grip = getButtonState(gamepad, GRIP);
        controller.menu = getButtonState(gamepad, THUMBPAD);

        controlsState.ctrlTriggers[idx] = controller.trigger.tapped;
        controller.pad.set(gamepad.axes[0], gamepad.axes[1]);
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
        controlsState.controllerType = 'htcvive';

        // Center camera
        if (right.trigger.tapped && camera && scene) {
            camera.center(scene);
        }

        // Skip dialogues
        if (controlsState.skipListener) {
            controlsState.action = 0;
            if (left.menu.tapped
                || right.menu.tapped) {
                controlsState.skipListener();
                return;
            }
        }

        // Hero movement
        controlsState.controlVector.copy(left.pad);

        // Action button
        controlsState.action = right.menu.tapped ? 1 : 0;

        controlsState.backButton = left.menu.tapped;

        if (left.menu.longPressed) {
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
        if (right.thumbpad.tapped) {
            hero.behaviour = (hero.behaviour + 1) % 4;
            if (hero.behaviour === 1) { // skip sporty
                hero.behaviour += 1;
            }
            hero.prevBehaviour = hero.behaviour;
        }
    }
}
