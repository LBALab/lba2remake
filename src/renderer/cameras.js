import THREE from 'three';
import {IsometricCamera} from './utils/IsometricCamera';

export function getIsometricCamera() {
    const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
    const offset = new THREE.Vector2(3500, 1000);
    const camera = new IsometricCamera(size, offset);

    document.addEventListener('mousemove', event => {
        if (document.pointerLockElement == document.body) {
            camera.offset.x += event.movementX;
            camera.offset.y += event.movementY;
            camera.updateProjectionMatrix();
        }
    }, false);

    return camera;
}

export function resizeIsometricCamera(camera) {
    camera.size = new THREE.Vector2(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
}

export function get3DCamera() {
    return new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 100); // 1m = 0.0625 units
}

export function resize3DCamera(camera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
