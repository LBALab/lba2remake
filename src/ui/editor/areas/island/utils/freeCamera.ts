import THREE from 'three';

export function get3DFreeCamera() {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.name = '3DCamera';
    const controlNode = new THREE.Object3D();
    controlNode.name = 'CameraControlNode';
    const orientation = new THREE.Object3D();
    orientation.name = 'AxisTransform';
    orientation.rotation.set(0, Math.PI, 0);
    orientation.updateMatrix();
    orientation.matrixAutoUpdate = false;
    controlNode.add(orientation);
    orientation.add(camera);
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        threeCamera: camera,
        controlNode,
        resize(width, height) {
            if (width !== this.width || height || this.height) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        },
        update: (island, controlsState, time) => {
            processFree3DMovement(controlsState, controlNode, island, time);
        },
    };
}

function processFree3DMovement(controlsState, controlNode, island, time) {
    let speedFactor = 0;
    let height = 0;
    if (island) {
        const groundInfo = island.physics.getGroundInfo(controlNode.position);
        height = groundInfo.height;
        speedFactor = Math.max(
            0.0,
            Math.min(1.0, (controlNode.position.y - groundInfo.height) * 0.7)
        );
    }

    const euler = new THREE.Euler();
    euler.setFromQuaternion(controlsState.cameraHeadOrientation, 'YXZ');
    const speed = new THREE.Vector3().set(
        controlsState.cameraSpeed.x * 7.2,
        -(controlsState.cameraSpeed.z * 12) * euler.x,
        controlsState.cameraSpeed.z * 7.2
    );

    speed.multiplyScalar((speedFactor * speedFactor * 0.125) + 1);
    speed.applyQuaternion(controlsState.cameraOrientation);
    speed.applyQuaternion(onlyY(controlsState.cameraHeadOrientation));
    speed.multiplyScalar(time.delta);

    controlNode.position.add(speed);
    controlNode.position.y = Math.max(height + 1.5, controlNode.position.y);
    controlNode.quaternion.copy(controlsState.cameraOrientation);
    controlNode.quaternion.multiply(controlsState.cameraHeadOrientation);
}

function onlyY(src) {
    const euler = new THREE.Euler();
    euler.setFromQuaternion(src, 'YXZ');
    euler.x = 0;
    euler.z = 0;
    return new THREE.Quaternion().setFromEuler(euler);
}
