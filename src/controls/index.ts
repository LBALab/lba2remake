import {makeFirstPersonMouseControls} from './mouse';
import {makeKeyboardControls} from './keyboard';
import {makeFirstPersonTouchControls} from './touch';
import { getParams } from '../params';
import { VRControls } from './vr';
import { SceneManager } from '../game/SceneManager';
import Renderer from '../renderer';
import Game from '../game/Game';
import GamepadManager from './Gamepad';

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
            new VRControls(sceneManager, game, renderer)
        ];
    } else if (params.mobile) {
        controls = [
            makeFirstPersonTouchControls(game),
            new GamepadManager(params, sceneManager, game),
        ];
    } else {
        controls = [
            makeFirstPersonMouseControls(params, elem, game),
            makeKeyboardControls(params, elem, sceneManager, game),
            new GamepadManager(params, sceneManager, game),
        ];
    }
    return controls;
}
