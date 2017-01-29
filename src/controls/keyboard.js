// @flow

import type {HeroPhysics} from '../game/hero';
import {switchMovementMode, savePosition, loadPosition} from '../game/hero';
import {switchStats} from '../renderer/stats';

export function makeKeyboardControls(heroPhysics: HeroPhysics, game: any) {
    const onKeyDown = keyDownHandler.bind(null, heroPhysics, game);
    const onKeyUp = keyUpHandler.bind(null, heroPhysics);
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);
    return {
        dispose: () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        }
    }
}

function keyDownHandler(heroPhysics, game, event) {
    var key = event.code || event.which || event.keyCode;
    switch (key) {
        case 87: // w
        case 38: // up
        case 'KeyW':
        case 'ArrowUp':
            heroPhysics.speed.z = -1;
            break;
        case 83: // s
        case 40: // down
        case 'KeyS':
        case 'ArrowDown':
            heroPhysics.speed.z = 1;
            break;
        case 65: // a
        case 37: // left
        case 'KeyA':
        case 'ArrowLeft':
            heroPhysics.speed.x = -1;
            break;
        case 68: // d
        case 39: // right
        case 'KeyD':
        case 'ArrowRigth':
            heroPhysics.speed.x = 1;
            break;
        case 34: // pagedown
        case 'PageDown':
            game.loading();
            game.getSceneManager().next(game.loaded);
            break;
        case 33: // pageup
        case 'PageUp':
            game.loading();
            game.getSceneManager().previous(game.loaded);
            break;
        case 70: // f
        case 'KeyF':
            switchStats();
            break;
        case 77: // m
        case 'KeyM':
            switchMovementMode(heroPhysics);
            break;
        case 80: // p
        case 'KeyP':
            game.pause();
            break;
        case 219:
        case 'BracketLeft':
            savePosition(heroPhysics, game.getSceneManager().getScene());
            break;
        case 221:
        case 'BracketRight':
            loadPosition(heroPhysics, game.getSceneManager().getScene());
            break;
    }
}

function keyUpHandler(config, event) {
    var key = event.code || event.which || event.keyCode;
    switch (key) {
        case 87: // w
        case 38: // up
        case 83: // s
        case 40: // down
        case 'KeyW':
        case 'ArrowUp':
        case 'KeyS':
        case 'ArrowDown':
            config.speed.z = 0;
            break;
        case 65: // a
        case 37: // left
        case 68: // d
        case 39: // right
        case 'KeyA':
        case 'ArrowLeft':
        case 'KeyD':
        case 'ArrowRigth':
            config.speed.x = 0;
            break;
    }
}
