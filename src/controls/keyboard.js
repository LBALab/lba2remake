import {GameEvents} from '../game/events';
import {switchMovementMode} from '../game/hero';
import {switchStats} from '../renderer/stats';

export function makeKeyboardControls(heroPhysics) {
    const onKeyDown = keyDownHandler.bind(null, heroPhysics);
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

function keyDownHandler(heroPhysics, event) {
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
            //GameEvents.scene.nextIsland();
            break;
        case 33: // pageup
        case 'PageUp':
            //GameEvents.scene.previousIsland();
            break;
        case 70: // f
        case 'KeyF':
            switchStats();
            break;
        case 77: // m
        case 'KeyM':
            switchMovementMode(heroPhysics);
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
