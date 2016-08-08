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
            GameEvents.Scene.NextIsland.trigger();
            break;
        case 'PageUp':
            GameEvents.Scene.PreviousIsland.trigger();
            break;
        case 'KeyF':
            GameEvents.Debug.SwitchStats.trigger();
            break;
        case 'KeyM':
            GameEvents.Mode.Switch.trigger();
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

