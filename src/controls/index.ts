import {makeFirstPersonMouseControls} from './mouse';
import {makeKeyboardControls} from './keyboard';
import {makeFirstPersonTouchControls} from './touch';
import { getParams } from '../params';
import { VRControls } from './vr';
import { SceneManager } from '../game/SceneManager';
import Renderer from '../renderer';
import Game from '../game/Game';
import GamepadControls from './GamepadControls';

export function createControls(
    vr: boolean,
    game: Game,
    elem: HTMLElement,
    sceneManager: SceneManager,
    renderer: Renderer
) {
    const params = getParams();
    let controls;
    if (vr) {
        controls = [
            new VRControls(sceneManager, game, renderer),
            new GamepadControls(params, sceneManager, game),
        ];
    } else if (params.mobile) {
        controls = [
            makeFirstPersonTouchControls(game),
            new GamepadControls(params, sceneManager, game),
        ];
    } else {
        controls = [
            makeFirstPersonMouseControls(params, elem, game),
            makeKeyboardControls(params, elem, sceneManager, game),
            new GamepadControls(params, sceneManager, game),
        ];
    }
    return controls;
}
