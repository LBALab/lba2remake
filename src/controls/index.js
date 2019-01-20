import {makeFirstPersonMouseControls} from './mouse.ts';
import {makeKeyboardControls} from './keyboard.ts';
import {makeGyroscopeControls} from './gyroscope.ts';
import {makeGamepadControls} from './gamepad.ts';
import {makeFirstPersonTouchControls} from './touch.ts';

export function createControls(params, game, canvas, sceneManager) {
    let controls;
    if (params.vr) {
        controls = [
            makeGyroscopeControls(game),
            makeGamepadControls(sceneManager, game)
        ];
        if (!params.mobile) {
            controls.push(makeKeyboardControls(params, canvas, sceneManager, game));
        }
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
