import * as THREE from 'three';
import {IsometricCamera} from './utils/IsometricCamera';

export function getIsometricCamera(use3d) {
    if (use3d) {
        return get3DCamera();
    }
    const size = getIsoCameraSize(window.innerWidth, window.innerHeight);
    const offset = new THREE.Vector2(3500, 1001);
    return new IsometricCamera(size, offset);
}

export function resizeIsometricCamera(camera, width, height) {
    if (camera.type === 'PerspectiveCamera') {
        resize3DCamera(camera, width, height);
    } else {
        camera.size.copy(getIsoCameraSize(width, height));
        camera.updateProjectionMatrix();
    }
}

function getIsoCameraSize(width, height) {
    if (width > height) {
        return new THREE.Vector2(560, (560 / width) * height);
    }
    return new THREE.Vector2((560 / height) * width, 560);
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
