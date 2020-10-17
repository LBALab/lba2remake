import {makeFirstPersonMouseControls} from './mouse';
import {makeKeyboardControls} from './keyboard';
import {makeFirstPersonTouchControls} from './touch';
import { getParams } from '../params';
import { VRControls } from './vr';

export function createControls(vr, game, elem, sceneManager, renderer) {
    const params = getParams();
    let controls;
    if (vr) {
        controls = [
            new VRControls(sceneManager, game, renderer)
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
