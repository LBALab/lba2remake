import * as THREE from 'three';

export function get3DOrbitCamera() {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    ); // 1m = 0.0625 units
    let angle = 0.8;
    let vAngle = 0.6;
    const controlNode = new THREE.Object3D();
    const orientation = new THREE.Object3D();
    orientation.rotation.set(0, Math.PI, 0);
    controlNode.add(orientation);
    orientation.add(camera);
    return {
        controlNode,
        threeCamera: camera,
        resize: (width, height) => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        },
        update: (island, rotateView, mouseSpeed, zoom, time) => {
            const height = 1;
            // if (model) {
            //     const bb = model.boundingBox;
            //     height = bb.max.y - bb.min.y;
            // }
            if (rotateView) {
                angle -= time.delta * 0.5;
            }
            angle += mouseSpeed.x * 0.005;
            vAngle += mouseSpeed.y * 0.005;
            vAngle = Math.min(Math.max(-1.5, vAngle), 1.5);
            if (Math.abs(mouseSpeed.x) > 0.05) {
                mouseSpeed.x *= 1 - Math.min(time.delta * 4, 1);
            } else {
                mouseSpeed.x = 0;
            }
            const distance = 4.8 + (zoom * 2.4);
            const euler = new THREE.Euler(0, -angle, vAngle, 'XYZ');
            const pos = new THREE.Vector3(1, 0, 0);
            pos.applyEuler(euler);
            pos.multiplyScalar(distance);
            pos.add(new THREE.Vector3(0, height * 0.5, 0));
            controlNode.position.copy(pos);
            controlNode.lookAt(new THREE.Vector3(0, height * 0.5, 0));
        }
    };
}
