import {makeFirstPersonMouseControls} from './mouse';
import {makeKeyboardControls} from './keyboard';
import {makeGyroscopeControls} from './gyroscope';
import {makeGamepadControls} from './gamepad';
import {makeFirstPersonTouchControls} from './touch';

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
