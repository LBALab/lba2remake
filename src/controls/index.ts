import {makeFirstPersonMouseControls} from './mouse';
import {makeKeyboardControls} from './keyboard';
import {makeFirstPersonTouchControls} from './touch';
import { getParams } from '../params';

export function createControls(game, elem, sceneManager) {
    const params = getParams();
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
