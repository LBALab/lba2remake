import * as THREE from 'three';

export function get3DOrbitCamera() {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.001,
        100
    ); // 1m = 0.0625 units
    let angle = 0.8;
    let vAngle = 0.6;
    return {
        threeCamera: camera,
        resize: (width, height) => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        },
        update: (model, rotateView, mouseSpeed, zoom, time) => {
            let height = 0;
            if (model) {
                const bb = model.boundingBox;
                height = bb.max.y - bb.min.y;
            }
            if (rotateView) {
                angle -= time.delta * 0.5;
            }
            angle += mouseSpeed.x * 0.005;
            vAngle += mouseSpeed.y * 0.005;
            vAngle = Math.min(Math.max(-1.5, vAngle), 1.5);
            if (Math.abs(mouseSpeed.x) > 0.05) {
                mouseSpeed.x = mouseSpeed.x * (1 - Math.min(time.delta * 4, 1));
            } else {
                mouseSpeed.x = 0;
            }
            const distance = 0.2 + (zoom * 0.1);
            const euler = new THREE.Euler(0, -angle, vAngle, 'XYZ');
            const pos = new THREE.Vector3(1, 0, 0);
            pos.applyEuler(euler);
            pos.multiplyScalar(distance);
            pos.add(new THREE.Vector3(0, height * 0.5, 0));
            camera.position.copy(pos);
            camera.lookAt(new THREE.Vector3(0, height * 0.5, 0));
        }
    };
}
