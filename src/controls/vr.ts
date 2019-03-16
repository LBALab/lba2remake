import {switchStats} from '../renderer/stats';

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
                        case 'Oculus Touch (Right)':
                            handleOculusRiftController(gamepad, sceneManager, game);
                            break;
                    }
                }
            }
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
}

const OculusTouch = {
    THUMBSTICK: 0,
    TRIGGER: 1,
    GRIP: 2,
    A: 3, // X
    B: 4, // Y
    THUMBREST: 5,
};

function handleOculusRiftController(gamepad, sceneManager, game) {
    const {controlsState} = game;
    const {THUMBSTICK, TRIGGER, GRIP, A, B, THUMBREST} = OculusTouch;
    const scene = sceneManager.getScene();
    const camera = scene && scene.camera;
    const hero = game.getState().hero;
    controlsState.action = 0;
    controlsState.jump = 0;
    controlsState.relativeToCam = true;

    const thumbstick = getButtonState(gamepad, THUMBSTICK); // Bahaviour loop
    const trigger = getButtonState(gamepad, TRIGGER); // throw
    const grip = getButtonState(gamepad, GRIP); // Sports Behaviour
    const buttonA = getButtonState(gamepad, A); // Action
    const buttonB = getButtonState(gamepad, B); // fps
    const thumbrest = getButtonState(gamepad, THUMBREST); // recentre

    if (buttonB.pressed) {
        if (controlsState.skipListener) {
            controlsState.skipListener();
            return;
        }
    }

    controlsState.controlVector.set(gamepad.axes[0], -gamepad.axes[1]);

    if (buttonA.longPressed && camera && scene) {
        camera.center(scene);
    }
    if (buttonB.longPressed) {
        switchStats();
    }

    hero.behaviour = hero.prevBehaviour;
    if (grip.pressed) {
        hero.prevBehaviour = hero.behaviour;
        hero.behaviour = 1;
        controlsState.jump = trigger.pressed ? 1 : 0;
    }
    if (thumbstick.pressed) {
        hero.behaviour = (hero.behaviour + 1) % 4;
        if (hero.behaviour === 1) { // skip
            hero.behaviour += 1;
        }
        hero.prevBehaviour = hero.behaviour;
    }
    controlsState.action = buttonA.pressed ? 1 : 0;
    if (!grip.pressed) {
        controlsState.weapon = trigger.pressed ? 1 : 0;
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
