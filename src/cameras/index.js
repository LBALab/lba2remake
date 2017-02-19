import THREE from 'three';

export function processCameraMovement(controlsState, cameras, scene, time) {
    if (controlsState.freeCamera) {
        if (scene.isIsland) {
            processFree3DMovement(controlsState, cameras.camera3D, scene, time);
        } else {
            processFreeIsoMovement(controlsState, cameras.isoCamera, scene, time);
        }
    }
}

const orientedSpeed = new THREE.Vector3();
const euler = new THREE.Euler();
const q = new THREE.Quaternion();

function processFree3DMovement(controlsState, camera, scene, time) {
    const groundHeight = scene.scenery.physics.getGroundHeight(camera.position.x, camera.position.z);
    const altitude = Math.max(0.0, Math.min(1.0, (camera.position.y - groundHeight) * 0.7));

    euler.setFromQuaternion(controlsState.cameraHeadOrientation, 'YXZ');
    const speed = new THREE.Vector3().set(
        controlsState.cameraSpeed.x * 0.3,
        -(controlsState.cameraSpeed.z * 0.5) * euler.x,
        controlsState.cameraSpeed.z * 0.5
    );

    orientedSpeed.copy(speed);
    orientedSpeed.multiplyScalar((altitude * altitude) * 3.0 + 1.0);
    orientedSpeed.applyQuaternion(controlsState.cameraOrientation);
    orientedSpeed.applyQuaternion(onlyY(controlsState.cameraHeadOrientation));
    orientedSpeed.multiplyScalar(time.delta);

    camera.position.add(orientedSpeed);
    camera.position.y = Math.max(groundHeight + 0.08, camera.position.y);
    camera.quaternion.copy(controlsState.cameraOrientation);
    camera.quaternion.multiply(controlsState.cameraHeadOrientation);
}

function processFreeIsoMovement(controlsState, camera, scene, time) {
    camera.offset.add(new THREE.Vector2(
        controlsState.cameraSpeed.x * time.delta * 500,
        -controlsState.cameraSpeed.z * time.delta * 500
    ));
    camera.updateProjectionMatrix();
}

function onlyY(src) {
    euler.setFromQuaternion(src, 'YXZ');
    euler.x = 0;
    euler.z = 0;
    return q.setFromEuler(euler);
}
