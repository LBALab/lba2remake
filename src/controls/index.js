import {makeFirstPersonMouseControls} from './mouse.ts';
import {makeKeyboardControls} from './keyboard.ts';
import {makeGamepadControls} from './gamepad.ts';
import {makeVRControls} from './vr.ts';
import {makeFirstPersonTouchControls} from './touch.ts';

export function createControls(params, game, canvas, sceneManager, renderer) {
    let controls;
    if (renderer.vr) {
        controls = [
            makeFirstPersonTouchControls(game),
            makeVRControls(game)
        ];
    } else if (params.mobile) {
        controls = [
            makeFirstPersonTouchControls(game),
            makeGamepadControls(sceneManager, game)
        ];
    } else {
        controls = [
            makeFirstPersonMouseControls(params, canvas, game),
            makeKeyboardControls(params, canvas, sceneManager, game),
            makeGamepadControls(sceneManager, game)
        ];
    }
    return controls;
}
