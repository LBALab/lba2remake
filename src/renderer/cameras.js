import THREE from 'three';

const v = 1086;

export function getIsometricCamera() {
    const halfWidth = Math.floor(window.innerWidth / 2) / v;
    const halfHeight = Math.floor(window.innerHeight / 2) / v;
    const camera = new THREE.OrthographicCamera(-halfWidth, halfWidth, halfHeight, -halfHeight, 0.1, 20); // 1m = 0.0625 units

    let y = 8.145;

    const target = new THREE.Vector3(1.94875, 0, 0.27);

    function updatePosition() {
        camera.position.copy(target);
        camera.position.add(new THREE.Vector3(-10, y, 10));
        camera.lookAt(target);
    }

    updatePosition();

    window.addEventListener('keydown', event => {
        if (event.code == 'NumpadAdd') {
            y += 0.001;
            console.log(y);
            updatePosition();
        } else if (event.code == 'NumpadSubtract') {
            y -= 0.001;
            console.log(y);
            updatePosition();
        }
    }, false);

    document.addEventListener('mousemove', event => {
        if (document.pointerLockElement == document.body) {
            target.x += event.movementX * 0.0005;
            target.z += event.movementX * 0.0005;
            target.x -= event.movementY * 0.0005;
            target.z += event.movementY * 0.0005;
            updatePosition();
        }
    }, false);

    return camera;
}

export function resizeIsometricCamera(camera, v) {
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
