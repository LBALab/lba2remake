import * as THREE from 'three';

export function get3DOrbitCamera() {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.001,
        100
    ); // 1m = 0.0625 units
    let angle = 0;
    return {
        threeCamera: camera,
        resize: (width, height) => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        },
        update: (model, rotateView, time) => {
            let height = 0;
            if (model) {
                const bb = model.boundingBox;
                height = bb.max.y - bb.min.y;
            }
            if (rotateView) {
                angle -= time.delta * 0.5;
            }
            camera.position.set(
                Math.cos(angle) * 0.2,
                height + 0.05,
                Math.sin(angle) * 0.2);
            camera.lookAt(new THREE.Vector3(0, height * 0.5, 0));
        }
    };
}
