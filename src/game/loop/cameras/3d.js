import THREE from 'three';

export function processFollow3DMovement(controlsState, camera, scene, time) {
    const hero = scene.getActor(0);
    const heroPos = new THREE.Vector3(0, 0.08, 0);
    heroPos.applyMatrix4(hero.threeObject.matrixWorld);
    camera.position.copy(heroPos);
    const offset = new THREE.Vector3(0, 0.1, -0.3);
    offset.applyQuaternion(hero.threeObject.quaternion);
    camera.position.add(offset);
    camera.lookAt(heroPos);
    controlsState.cameraOrientation.copy(hero.threeObject.quaternion);
    controlsState.cameraOrientation.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI));
}

export function processFree3DMovement(controlsState, camera, scene, time) {
    const groundInfo = scene.scenery.physics.getGroundInfo(camera.position);
    const altitude = Math.max(0.0, Math.min(1.0, (camera.position.y - groundInfo.height) * 0.7));

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
    camera.position.y = Math.max(groundInfo.height + 0.08, camera.position.y);
    camera.quaternion.copy(controlsState.cameraOrientation);
    camera.quaternion.multiply(controlsState.cameraHeadOrientation);
}

function onlyY(src) {
    const euler = new THREE.Euler();
    euler.setFromQuaternion(src, 'YXZ');
    euler.x = 0;
    euler.z = 0;
    return new THREE.Quaternion().setFromEuler(euler);
}
