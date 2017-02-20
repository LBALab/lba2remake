import THREE from 'three';

export function processCameraMovement(controlsState, cameras, scene, time) {
    if (controlsState.freeCamera) {
        if (scene.isIsland) {
            processFree3DMovement(controlsState, cameras.camera3D, scene, time);
        } else {
            processFreeIsoMovement(controlsState, cameras.isoCamera, time);
        }
    } else {
        if (scene.isIsland) {
            processFollow3DMovement(controlsState, cameras.camera3D, scene, time);
        } else {
            processFollowIsoMovement(controlsState, cameras.camera3D, scene, time);
        }
    }
}

function processFollow3DMovement(controlsState, camera, scene, time) {
    const hero = scene.getActor(0);
    const heroPos = new THREE.Vector3(0, 0.04, 0);
    heroPos.applyMatrix4(hero.threeObject.matrixWorld);
    camera.position.copy(heroPos);
    const offset = new THREE.Vector3(0, 0.2, -0.4);
    offset.applyQuaternion(hero.threeObject.quaternion);
    camera.position.add(offset);
    camera.lookAt(heroPos);
    controlsState.cameraOrientation.copy(hero.threeObject.quaternion);
    controlsState.cameraOrientation.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI));
}

function processFree3DMovement(controlsState, camera, scene, time) {
    const groundHeight = scene.scenery.physics.getGroundHeight(camera.position.x, camera.position.z);
    const altitude = Math.max(0.0, Math.min(1.0, (camera.position.y - groundHeight) * 0.7));

    const euler = new THREE.Euler();
    euler.setFromQuaternion(controlsState.cameraHeadOrientation, 'YXZ');
    const speed = new THREE.Vector3().set(
        controlsState.cameraSpeed.x * 0.3,
        -(controlsState.cameraSpeed.z * 0.5) * euler.x,
        controlsState.cameraSpeed.z * 0.5
    );

    speed.multiplyScalar((altitude * altitude) * 3.0 + 1.0);
    speed.applyQuaternion(controlsState.cameraOrientation);
    speed.applyQuaternion(onlyY(controlsState.cameraHeadOrientation));
    speed.multiplyScalar(time.delta);

    camera.position.add(speed);
    camera.position.y = Math.max(groundHeight + 0.08, camera.position.y);
    camera.quaternion.copy(controlsState.cameraOrientation);
    camera.quaternion.multiply(controlsState.cameraHeadOrientation);
}

function processFollowIsoMovement(controlsState, camera, scene, time) {

}

function processFreeIsoMovement(controlsState, camera, time) {
    camera.offset.add(new THREE.Vector2(
        controlsState.cameraSpeed.x * time.delta * 500,
        -controlsState.cameraSpeed.z * time.delta * 500
    ));
    camera.updateProjectionMatrix();
}

function onlyY(src) {
    const euler = new THREE.Euler();
    euler.setFromQuaternion(src, 'YXZ');
    euler.x = 0;
    euler.z = 0;
    return new THREE.Quaternion().setFromEuler(euler);
}
