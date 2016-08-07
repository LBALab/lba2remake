import THREE from 'three';

const euler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
const MAX_X_ANGLE = Math.PI / 3;

// Move pointerLock mechanics out of this
export function makeMouseControls(domElement, heroPhysics) {
    const controls = {
        enabled: false,
        arrows: {x: 0, y: 0}
    };

    const onMouseMove = handleMouseEvent.bind(null, controls, heroPhysics);
    const onPointerLockChange = pointerLockChanged.bind(null, controls);

    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('pointerlockchange', onPointerLockChange, false);
    domElement.addEventListener('click', onClick, false);

    controls.dispose = function() {
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('pointerlockchange', onPointerLockChange);
        domElement.removeEventListener('click', onClick);
    };

    return controls;
}

function handleMouseEvent(controls, heroPhysics, event) {
    if (controls.enabled) {
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        euler.setFromQuaternion(heroPhysics.headOrientation, 'YXZ');
        euler.y = 0;
        euler.x = Math.min(Math.max(euler.x - movementY * 0.002, -MAX_X_ANGLE), MAX_X_ANGLE);
        heroPhysics.headOrientation.setFromEuler(euler);

        euler.setFromQuaternion(heroPhysics.orientation, 'YXZ');
        euler.x = 0;
        euler.y = euler.y - movementX * 0.002;
        heroPhysics.orientation.setFromEuler(euler);
    }
}

function pointerLockChanged(controls) {
    controls.enabled = document.pointerLockElement == document.body
}

function onClick() {
    document.body.requestPointerLock()
}
