import { switchStats } from '../../renderer/stats';
import { getButtonState, getGamepadIndex } from './utils';

const BUTTONS = {
    TOUCHPAD: 0,
    TRIGGER: 1
};

export default class OculusGo {
    supports(id) {
        return id === 'Gear VR Controller'
            || id === 'Oculus Go Controller';
    }

    handleGamepad(gamepad, idx, {sceneManager, game}) {
        const {controlsState} = game;
        const {TOUCHPAD, TRIGGER} = BUTTONS;
        const scene = sceneManager.getScene();
        const camera = scene && scene.camera;
        const hero = game.getState().hero;
        controlsState.action = 0;
        controlsState.jump = 0;
        controlsState.relativeToCam = true;
        controlsState.controllerType = 'oculusgo';

        const touchpad = getButtonState(gamepad, TOUCHPAD);
        const trigger = getButtonState(gamepad, TRIGGER);

        controlsState.ctrlTriggers[getGamepadIndex(gamepad, idx)] = trigger.tapped;

        if (touchpad.tapped || trigger.tapped) {
            if (controlsState.skipListener) {
                controlsState.skipListener();
                return;
            }
        }

        if (touchpad.touched) {
            controlsState.controlVector.set(gamepad.axes[0], -gamepad.axes[1]);
            controlsState.altControlVector.set(gamepad.axes[0], 0);
        } else {
            controlsState.controlVector.set(0, 0);
            controlsState.altControlVector.set(0, 0);
        }
        if (touchpad.pressed) {
            controlsState.controlVector.set(0, 0);
            controlsState.altControlVector.set(0, 0);
        }
        if (trigger.tapped) {
            if (!controlsState.firstPerson && camera && scene) {
                camera.center(scene);
            } else if (controlsState.firstPerson) {
                if (hero.behaviour === 1) {
                    controlsState.jump = 1;
                } else {
                    controlsState.action = 1;
                }
            }
        }
        if (trigger.longPressed) {
            switchStats();
        }
        if (touchpad.longPressed) {
            hero.behaviour = (hero.behaviour + 1) % 4;
        }
        controlsState.action = touchpad.tapped ? 1 : 0;
    }

    update() {}
}
