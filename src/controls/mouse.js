import THREE from 'three';

const euler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
const MAX_X_ANGLE = Math.PI / 3;

// Move pointerLock mechanics out of this
export function makeMouseOrientationControls(domElement, heroPhysics) {
    const config = {
        enabled: false,
        arrows: {x: 0, y: 0}
    };

    const ptrLock = setupPointerLock(config, domElement);
    const onMouseMove = handleMouseEvent.bind(null, config, heroPhysics.location);
    document.addEventListener('mousemove', onMouseMove, false);

    config.update = function(dt) {
        if (config.enabled) {
            euler.setFromQuaternion(heroPhysics.location.headOrientation, 'YXZ');
            euler.set(0, -euler.y, 0, 'YXZ');
            heroPhysics.direction.setFromEuler(euler);
        }
    };

    config.dispose = function() {
        document.removeEventListener('mousemove', onMouseMove, false);
        ptrLock.dispose();
    };
    return config;
}

function handleMouseEvent(config, location, event) {
    if (config.enabled) {
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

function setupPointerLock(config, domElement) {
    function pointerLockChanged() {
        config.enabled = document.pointerLockElement == document.body
    }

    function onClick() {
        document.body.requestPointerLock()
    }

    document.addEventListener('pointerlockchange', pointerLockChanged, false);
    domElement.addEventListener('click', onClick, false);

    return {
        dispose: function() {
            document.removeEventListener('pointerlockchange', pointerLockChanged);
            domElement.removeEventListener('click', onClick);
        }
    };
}
