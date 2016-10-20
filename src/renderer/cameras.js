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

export function getIsometric3DCamera() {
    let v = 1088;
    const halfWidth = Math.floor(window.innerWidth / 2) / v;
    const halfHeight = Math.floor(window.innerHeight / 2) / v;
    const camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 0.1, 20); // 1m = 0.0625 units

    const lookAt = new THREE.Vector3(1.94875, 0, 0.27);
    camera.position.copy(lookAt);
    camera.position.add(new THREE.Vector3(-10, 8.1, 10));
    camera.lookAt(lookAt);

    const mv = 0.005;
    window.addEventListener('keydown', event => {
        let update = false;
        switch (event.code) {
            case 'ArrowUp':
                camera.position.x += mv;
                lookAt.x += mv;
                update = true;
                break;
            case 'ArrowDown':
                camera.position.x -= mv;
                lookAt.x -= mv;
                update = true;
                break;
            case 'ArrowLeft':
                camera.position.z += mv;
                lookAt.z += mv;
                update = true;
                break;
            case 'ArrowRight':
                camera.position.z -= mv;
                lookAt.z -= mv;
                update = true;
                break;
            case 'NumpadAdd':
                v += 1;
                update = true;
                break;
            case 'NumpadSubtract':
                v -= 1;
                update = true;
                break;
        }
        if (update) {
            camera.lookAt(lookAt);
            resizeIsometric3DCamera(camera, v);
            console.log(lookAt, v);
        }
    }, false);

    return camera;
}

export function resizeIsometric3DCamera(camera, v) {
    v = v || 1088;
    const halfWidth = Math.floor(window.innerWidth / 2) / v;
    const halfHeight = Math.floor(window.innerHeight / 2) / v;
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
}

export function get3DCamera() {
    return new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.001, 100); // 1m = 0.0625 units
}

export function resize3DCamera(camera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
