import THREE from 'three';

const euler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
const MAX_X_ANGLE = Math.PI / 3;

// Move pointerLock mechanics out of this
export function makeMouseControls(domElement, heroPhysics) {
    const controls = {
        enabled: false,
        arrows: {x: 0, y: 0}
    };

    const onMouseMove = handleMouseEvent.bind(null, controls, heroPhysics.location);
    const onPointerLockChange = pointerLockChanged.bind(null, controls);

    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('pointerlockchange', onPointerLockChange, false);
    domElement.addEventListener('click', onClick, false);

    controls.dispose = function() {
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('pointerlockchange', onPointerLockChange);
        domElement.removeEventListener('click', onClick);
    };

    controls.update = function(dt) {
        if (controls.enabled) {
            euler.setFromQuaternion(heroPhysics.location.headOrientation, 'YXZ');
            euler.set(0, -euler.y, 0, 'YXZ');
            heroPhysics.direction.setFromEuler(euler);
        }
    };

    return controls;
}

function handleMouseEvent(controls, location, event) {
    if (controls.enabled) {
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

function pointerLockChanged(controls) {
    controls.enabled = document.pointerLockElement == document.body
}

function onClick() {
    document.body.requestPointerLock()
}
