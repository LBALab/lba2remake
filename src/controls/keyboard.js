import THREE from 'three';
import {GameEvents} from '../game/events';

const euler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
const MAX_X_ANGLE = Math.PI / 3;

export function makeKeyboardControls(domElement, heroPhysics) {
    const config = {
        arrows: {x: 0, y: 0}
    };

    window.addEventListener('keydown', onKeyDown.bind(null, config), false);
    window.addEventListener('keyup', onKeyUp.bind(null, config), false);

    config.update = function(dt) {

    };

    return config;
}

function onKeyDown(config, event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            config.arrows.y = -1;
            break;
        case 'KeyS':
        case 'ArrowDown':
            config.arrows.y = 1;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            config.arrows.x = -1;
            break;
        case 'KeyD':
        case 'ArrowRigth':
            config.arrows.x = 1;
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
    }
}

function onKeyUp(config, event) {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
        case 'KeyS':
        case 'ArrowDown':
            config.arrows.y = 0;
            break;
        case 'KeyA':
        case 'ArrowLeft':
        case 'KeyD':
        case 'ArrowRigth':
            config.arrows.x = 0;
            break;
    }
}

