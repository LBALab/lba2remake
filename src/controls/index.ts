import {makeFirstPersonMouseControls} from './mouse';
import {makeKeyboardControls} from './keyboard';
import {makeFirstPersonTouchControls} from './touch';

export function createControls(params, game, elem, sceneManager) {
    let controls;
    if (params.mobile) {
        controls = [
            makeFirstPersonTouchControls(game),
        ];
    } else {
        controls = [
            makeFirstPersonMouseControls(params, elem, game),
            makeKeyboardControls(params, elem, sceneManager, game),
        ];
    }
    return controls;
}
