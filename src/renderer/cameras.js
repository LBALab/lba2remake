import THREE from 'three';

export function getIsometricCamera() {
    let v = 1086;
    const halfWidth = Math.floor(window.innerWidth / 2) / v;
    const halfHeight = Math.floor(window.innerHeight / 2) / v;
    const camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 0.1, 20); // 1m = 0.0625 units

    let y = 8.145;

    const lookAt = new THREE.Vector3(1.94875, 0, 0.27);
    camera.position.copy(lookAt);
    camera.position.add(new THREE.Vector3(-10, y, 10));
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
                //v += 1;
                y += 0.001;
                camera.position.copy(lookAt);
                camera.position.add(new THREE.Vector3(-10, y, 10));
                update = true;
                break;
            case 'NumpadSubtract':
                //v -= 1;
                y -= 0.001;
                camera.position.copy(lookAt);
                camera.position.add(new THREE.Vector3(-10, y, 10));
                update = true;
                break;
        }
        if (update) {
            camera.lookAt(lookAt);
            resizeIsometricCamera(camera, v);
            console.log(lookAt, v, y);
        }
    }, false);

    return camera;
}

export function resizeIsometricCamera(camera, v) {
    v = v || 1086;
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
