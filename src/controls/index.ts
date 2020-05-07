import {makeFirstPersonMouseControls} from './mouse';
import {makeKeyboardControls} from './keyboard';
import {makeVRControls} from './vr';
import {makeFirstPersonTouchControls} from './touch';

export function createControls(params, game, elem, sceneManager, renderer) {
    let controls;
    if (renderer.vr) {
        controls = [
            makeVRControls(sceneManager, game)
        ];
    } else if (params.mobile) {
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
