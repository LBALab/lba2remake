import {GameEvents} from '../game/events';

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
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            heroPhysics.speed.z = -1;
            break;
        case 'KeyS':
        case 'ArrowDown':
            heroPhysics.speed.z = 1;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            heroPhysics.speed.x = -1;
            break;
        case 'KeyD':
        case 'ArrowRigth':
            heroPhysics.speed.x = 1;
            break;
        case 'PageDown':
            GameEvents.scene.nextIsland();
            break;
        case 'PageUp':
            GameEvents.scene.previousIsland();
            break;
        case 'KeyF':
            GameEvents.debug.switchStats();
            break;
        case 'KeyM':
            GameEvents.mode.switchMode();
            break;
    }
}

function keyUpHandler(config, event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
        case 'KeyS':
        case 'ArrowDown':
            config.speed.z = 0;
            break;
        case 'KeyA':
        case 'ArrowLeft':
        case 'KeyD':
        case 'ArrowRigth':
            config.speed.x = 0;
            break;
    }
}

