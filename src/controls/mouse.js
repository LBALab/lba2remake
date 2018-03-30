// @flow

import * as THREE from 'three';

// Move pointerLock mechanics out of this
export function makeFirstPersonMouseControls(params: Object, domElement: HTMLElement, game: any) {
    const controls = {
        enabled: false
    };

    const onMouseMove = handleMouseEvent.bind(null, controls, game);
    const onPointerLockChange = pointerLockChanged.bind(null, controls);
    const onClick = handleClick.bind(null, params, game);

    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('pointerlockchange', onPointerLockChange, false);
    domElement.addEventListener('click', onClick, false);

    return {
        dispose: () => {
            document.removeEventListener('mousemove', onMouseMove, false);
            document.removeEventListener('pointerlockchange', onPointerLockChange);
            domElement.removeEventListener('click', onClick);
        }
    };
}

const euler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
const MAX_X_ANGLE = Math.PI / 2.5;

function handleMouseEvent(controls, game, event: MouseEvent) {
    if (controls.enabled && game.controlsState.freeCamera) {
        // Not supported on IE / Safari
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        euler.setFromQuaternion(game.controlsState.cameraHeadOrientation, 'YXZ');
        euler.y = 0;
        euler.x = Math.min(Math.max(euler.x - (movementY * 0.002), -MAX_X_ANGLE), MAX_X_ANGLE);
        game.controlsState.cameraHeadOrientation.setFromEuler(euler);

        euler.setFromQuaternion(game.controlsState.cameraOrientation, 'YXZ');
        euler.x = 0;
        euler.y -= movementX * 0.002;
        game.controlsState.cameraOrientation.setFromEuler(euler);
    }
}

function pointerLockChanged(controls) {
    controls.enabled = (document: any).pointerLockElement === document.body;
}

function handleClick(params, game) {
    if (document.body.requestPointerLock && (!params.editor || game.controlsState.freeCamera)) {
        document.body.requestPointerLock();
    }
}
