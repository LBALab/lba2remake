import THREE from 'three';
import {IsometricCamera} from './utils/IsometricCamera';

export function getIsometricCamera(pixelRatio) {
    const size = new THREE.Vector2(
        Math.floor(window.innerWidth * 0.5) * 2 * pixelRatio,
        Math.floor(window.innerHeight * 0.5) * 2 * pixelRatio
    );
    const offset = new THREE.Vector2(3500, 1001);
    const camera = new IsometricCamera(size, offset);

    document.addEventListener('mousemove', event => {
        if (document.pointerLockElement == document.body) {
            camera.offset.x = camera.offset.x + event.movementX;
            camera.offset.y = camera.offset.y - event.movementY;
            camera.updateProjectionMatrix();
        }
    }, false);

    return camera;
}

export function resizeIsometricCamera(camera, pixelRatio) {
    camera.size.set(
        Math.floor(window.innerWidth * 0.5) * 2 * pixelRatio,
        Math.floor(window.innerHeight * 0.5) * 2 * pixelRatio
    );
    camera.updateProjectionMatrix();
}

export function get3DCamera() {
    return new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 100); // 1m = 0.0625 units
}

export function resize3DCamera(camera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
