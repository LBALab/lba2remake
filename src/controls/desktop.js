import THREE from 'three';
import {GameEvents} from '../game/events';

const euler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
const MAX_X_ANGLE = Math.PI / 3;

export function makeDesktopControls(domElement, heroPhysics) {
    const config = {
        lockedIn: false,
        arrows: {x: 0, y: 0}
    };

    document.addEventListener('mousemove', onMouseMove.bind(null, config, heroPhysics.location), false );
    window.addEventListener('keydown', onKeyDown.bind(null, config), false);
    window.addEventListener('keyup', onKeyUp.bind(null, config), false);

    setupPointerLock(config, domElement);

    config.update = function(dt) {

    }
}

function onMouseMove(config, location, event) {
    if (config.lockedIn) {
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        euler.setFromQuaternion(location.headOrientation, 'YXZ');
        let x = euler.x;
        let y = euler.y;
        x = Math.min(Math.max(x - movementY * 0.002, -MAX_X_ANGLE), MAX_X_ANGLE);
        y = y - movementX * 0.002;
        euler.set(x, y, 0, 'YXZ');
        location.headOrientation.setFromEuler(euler);
    }
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

function setupPointerLock(config, domElement) {
    document.addEventListener('pointerlockchange', () => {
        config.lockedIn = document.pointerLockElement == document.body;
    }, false);

    domElement.addEventListener('click', function() {
        document.body.requestPointerLock();
    });
}
