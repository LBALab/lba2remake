import THREE from 'three';

export function getIsometricCamera() {
    const halfWidth = Math.floor(window.innerWidth / 2);
    const halfHeight = Math.floor(window.innerHeight / 2);
    const camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, -halfHeight, halfHeight, 0.001, 100); // 1m = 0.0625 units
    camera.position.z = -1;
    camera.lookAt(new THREE.Vector3());
    return camera;
}

export function resizeIsometricCamera(camera) {
    const halfWidth = Math.floor(window.innerWidth / 2);
    const halfHeight = Math.floor(window.innerHeight / 2);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = -halfHeight;
    camera.bottom = halfHeight;
    camera.updateProjectionMatrix();
}


export function get3DCamera() {
    return new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.001, 100); // 1m = 0.0625 units
}

export function resize3DCamera(camera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
