import * as THREE from 'three';
import {switchStats} from '../renderer/stats';

const oculusTouch = {
    left: makeOculusTouchController('LEFT'),
    right: makeOculusTouchController('RIGHT'),
};

export function makeVRControls(sceneManager: any, game: any) {
    return {
        type: 'vr',
        dispose: () => {},
        update: () => {
            const gamepads = navigator.getGamepads();
            for (let i = 0; i < gamepads.length; i += 1) {
                const gamepad = gamepads[i];
                // The array may contain undefined gamepads, so check for that as
                // well as a non-null pose. VR clicker devices such as the Carboard
                // touch handler for Daydream have a displayId but no pose.
                if (gamepad) { // && (gamepad.pose || gamepad.displayId)) {
                    updateState(gamepad);
                    switch (gamepad.id) {
                        case 'Oculus Go Controller':
                        // case 'Oculus Remote':
                            handleOculusGoController(gamepad, sceneManager, game);
                            break;
                        case 'Oculus Touch (Left)':
                            updateOculusTouchController(gamepad, oculusTouch.left, game, i);
                            break;
                        case 'Oculus Touch (Right)':
                            updateOculusTouchController(gamepad, oculusTouch.right, game, i);
                            break;
                    }
                }
            }
            unifiedOculusTouchHandler(oculusTouch, sceneManager, game);
        }
    };
}

const OculusGo = {
    TOUCHPAD: 0,
    TRIGGER: 1
};

//
// Using following code as documentation:
// https://github.com/stewdio/THREE.VRController/blob/master/VRController.js
//
function handleOculusGoController(gamepad, sceneManager, game) {
    const {controlsState} = game;
    const {TOUCHPAD, TRIGGER} = OculusGo;
    const scene = sceneManager.getScene();
    const camera = scene && scene.camera;
    const hero = game.getState().hero;
    controlsState.action = 0;
    controlsState.relativeToCam = true;

    const touchpad = getButtonState(gamepad, TOUCHPAD);
    const trigger = getButtonState(gamepad, TRIGGER);
    if (touchpad.tapped || trigger.tapped) {
        if (controlsState.skipListener) {
            controlsState.skipListener();
            return;
        }
    }

    if (touchpad.touched) {
        controlsState.controlVector.set(gamepad.axes[0], -gamepad.axes[1]);
    } else {
        controlsState.controlVector.set(0, 0);
    }
    if (touchpad.pressed) {
        controlsState.controlVector.set(0, 0);
    }
    if (trigger.tapped && camera && scene) {
        camera.center(scene);
    }
    if (trigger.longPressed) {
        switchStats();
    }
    if (touchpad.longPressed) {
        hero.behaviour = (hero.behaviour + 1) % 4;
    }
    controlsState.action = touchpad.tapped ? 1 : 0;
    controlsState.ctrlTriggers[0] = trigger.tapped;
}

const OculusTouch = {
    THUMBSTICK: 0,
    TRIGGER: 1,
    GRIP: 2,
    A: 3,
    X: 3,
    B: 4,
    Y: 4,
    THUMBREST: 5,
};

function makeOculusTouchController(type) {
    return {
        type,
        enabled: false,
        pad: new THREE.Vector2()
    };
}

function updateOculusTouchController(gamepad, controller, game, id) {
    const {THUMBSTICK, TRIGGER, GRIP, X, Y, A, B} = OculusTouch;
    const {controlsState} = game;

    controller.enabled = true;
    controller.thumbstick = getButtonState(gamepad, THUMBSTICK);
    controller.trigger = getButtonState(gamepad, TRIGGER);
    controller.grip = getButtonState(gamepad, GRIP);

    if (controller.type === 'LEFT') {
        controller.buttonX = getButtonState(gamepad, X);
        controller.buttonY = getButtonState(gamepad, Y);
    } else {
        controller.buttonA = getButtonState(gamepad, A);
        controller.buttonB = getButtonState(gamepad, B);
    }
    controlsState.ctrlTriggers[id] = controller.trigger.tapped;
    controller.pad.set(gamepad.axes[0], -gamepad.axes[1]);
}

function unifiedOculusTouchHandler({left, right}, sceneManager, game) {
    if (!left.enabled || !right.enabled)
        return;

    const {controlsState} = game;
    const scene = sceneManager.getScene();
    const camera = scene && scene.camera;
    const hero = game.getState().hero;

    controlsState.relativeToCam = true;
    controlsState.jump = 0;
    controlsState.weapon = 0;

    // Center camera
    if (right.trigger.tapped && camera && scene) {
        camera.center(scene);
    }

    // Skip dialogues
    if (controlsState.skipListener) {
        controlsState.action = 0;
        if (left.buttonX.tapped
            || left.buttonY.tapped
            || right.buttonA.tapped
            || right.buttonB.tapped) {
            controlsState.skipListener();
        }
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
    if (left.buttonY.tapped || right.buttonB.tapped) {
        hero.behaviour = (hero.behaviour + 1) % 4;
        if (hero.behaviour === 1) { // skip sporty
            hero.behaviour += 1;
        }
        hero.prevBehaviour = hero.behaviour;
    }
}

const gamepadState = {};

const getButtonState = (gamepad, button) => gamepadState[gamepad.id].buttons[button];

function updateState(gamepad) {
    if (gamepad.id in gamepadState) {
        const state = gamepadState[gamepad.id];
        gamepad.buttons.forEach((button, idx) => {
            const bState = state.buttons[idx];
            bState.touched = button.touched;
            bState.tapped = false;
            bState.longPressed = false;
            if (button.pressed) {
                if (bState.pressed === false) {
                    bState.pressed = true;
                    bState._pressStart = Date.now();
                }
            } else if (bState.pressed) {
                if (Date.now() - bState._pressStart < 300) {
                    bState.tapped = true;
                } else {
                    bState.longPressed = true;
                }
                bState.pressed = false;
            }
        });
    } else {
        gamepadState[gamepad.id] = {
            buttons: gamepad.buttons.map(button => ({
                pressed: button.pressed,
                touched: button.touched,
                tapped: false,
                longPressed: false,
                _pressStart: button.pressed ? Date.now() : 0
            }))
        };
    }
}
