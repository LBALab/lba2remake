import * as THREE from 'three';
import {IsometricCamera} from './utils/IsometricCamera';

export function getIsometricCamera() {
    const width = (480 / window.innerHeight) * window.innerWidth;
    const size = new THREE.Vector2(width, 480);
    const offset = new THREE.Vector2(3500, 1001);
    return new IsometricCamera(size, offset);
}

export function resizeIsometricCamera(camera, pixelRatio, width, height) {
    const tWidth = (480 / height) * width;
    camera.size.set(tWidth, 480);
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
