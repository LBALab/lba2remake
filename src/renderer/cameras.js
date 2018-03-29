import * as THREE from 'three';
import {IsometricCamera} from './utils/IsometricCamera';

export function getIsometricCamera(pixelRatio) {
    const size = new THREE.Vector2(
        Math.floor(window.innerWidth * 0.5) * 2 * pixelRatio,
        Math.floor(window.innerHeight * 0.5) * 2 * pixelRatio
    );
    const offset = new THREE.Vector2(3500, 1001);
    return new IsometricCamera(size, offset);
}

export function resizeIsometricCamera(camera, pixelRatio, width, height) {
    camera.size.set(width * pixelRatio, height * pixelRatio);
    camera.updateProjectionMatrix();
}

export function get3DCamera() {
    return new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.001,
        100
    ); // 1m = 0.0625 units
}

export function resize3DCamera(camera, width, height) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}
