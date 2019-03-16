import {makeFirstPersonMouseControls} from './mouse.ts';
import {makeKeyboardControls} from './keyboard.ts';
import {makeGamepadControls} from './gamepad.ts';
import {makeVRControls} from './vr.ts';
import {makeFirstPersonTouchControls} from './touch.ts';

export function createControls(params, game, elem, sceneManager, renderer) {
    let controls;
    if (renderer.vr) {
        controls = [
            makeFirstPersonTouchControls(game),
            makeVRControls(sceneManager, game)
        ];
    } else if (params.mobile) {
        controls = [
            makeFirstPersonTouchControls(game),
            makeGamepadControls(sceneManager, game)
        ];
    } else {
        controls = [
            makeFirstPersonMouseControls(params, elem, game),
            makeKeyboardControls(params, elem, sceneManager, game),
            makeGamepadControls(sceneManager, game)
        ];
    }
    return controls;
}
