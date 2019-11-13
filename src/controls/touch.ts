import THREE from 'three';

// Move pointerLock mechanics out of this
export function makeFirstPersonTouchControls(game: any) {
    const controls = {
        enabled: true,
        prevPageX: 0,
        prevPageY: 0,
        pageX: 0,
        pageY: 0
    };

    const onTouchMove = handleTouchEvent.bind(null, controls, game);
    const onTouchStart = handleTouchStartEvent.bind(null, controls, game);
    const onTouchEnd = handleTouchEndEvent.bind(null, controls, game);

    document.addEventListener('touchmove', onTouchMove, false);
    document.addEventListener('touchstart', onTouchStart, false);
    document.addEventListener('touchend', onTouchEnd, false);

    return {
        type: 'touch',
        dispose: () => {
            document.removeEventListener('touchmove', onTouchMove, false);
            document.removeEventListener('touchstart', onTouchStart, false);
            document.removeEventListener('touchend', onTouchEnd, false);
        }
    };
}

const euler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
const MAX_X_ANGLE = Math.PI / 2.5;

function handleTouchEvent(controls, game, event: TouchEvent) {
    if (controls.enabled) {
        game.controlsState.freeCamera = true;

        // Not supported on IE / Safari
        controls.prevPageX = controls.pageX;
        controls.prevPageY = controls.pageY;
        controls.pageX = event.touches[0].clientX || 0;
        controls.pageY = event.touches[0].clientY || 0;

        const movementX = controls.pageX - controls.prevPageX;
        const movementY = controls.pageY - controls.prevPageY;
        if (movementX > 50 || movementY > 50 || movementX < -50 || movementY < -50)
            return;

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

let startTime = null;

function handleTouchStartEvent() {
    startTime = Date.now();
}

function handleTouchEndEvent(controls, game) {
    const endTime = Date.now();
    const elapsed = endTime - startTime;
    if (elapsed < 300) {
        if (game.controlsState.skipListener) {
            game.controlsState.skipListener();
        }
    }
}
