import * as THREE from 'three';

const CAMERA_HERO_OFFSET = new THREE.Vector3(0, 0.15, -0.2);
const HERO_TARGET_POS = new THREE.Vector3(0, 0.08, 0);

export function initFollow3DMovement(controlsState, camera, scene) {
    const hero = scene.actors[0];
    const heroPos = HERO_TARGET_POS.clone();
    heroPos.applyMatrix4(hero.threeObject.matrixWorld);

    if (!controlsState.vr) {
        const cameraPos = CAMERA_HERO_OFFSET.clone();
        cameraPos.applyMatrix4(hero.threeObject.matrixWorld);
        controlsState.cameraLerp.copy(cameraPos);
        controlsState.cameraLookAtLerp.copy(heroPos);
        camera.position.copy(cameraPos);
        camera.lookAt(controlsState.cameraLookAtLerp);
    }
}

export function processFollow3DMovement(controlsState, camera, scene) {
    const hero = scene.actors[0];
    const heroPos = HERO_TARGET_POS.clone();
    const cameraPos = CAMERA_HERO_OFFSET.clone();
    heroPos.applyMatrix4(hero.threeObject.matrixWorld);
    cameraPos.applyMatrix4(hero.threeObject.matrixWorld);
    scene.scenery.physics.processCameraCollisions(cameraPos);

    if (controlsState.vr) {
        if (camera.position.distanceTo(cameraPos) > 0.3) {
            const orientation = [cameraPos.x - heroPos.x, cameraPos.z - heroPos.z];
            camera.position.copy(cameraPos);
            const euler = new THREE.Euler();
            const q = controlsState.cameraOrientation;
            euler.setFromQuaternion(q, 'YXZ');
            euler.y = Math.atan2(-orientation[1], orientation[0]) + (Math.PI / 2);
            q.setFromEuler(euler);
        }

        camera.quaternion.copy(controlsState.cameraOrientation);
        camera.quaternion.multiply(controlsState.cameraHeadOrientation);
    } else {
        controlsState.cameraLerp.lerpVectors(camera.position, cameraPos, 0.025);
        controlsState.cameraLookAtLerp.lerpVectors(
            controlsState.cameraLookAtLerp.clone(),
            heroPos,
            0.1);
        camera.position.set(
            controlsState.cameraLerp.x,
            controlsState.cameraLerp.y,
            controlsState.cameraLerp.z);
        camera.lookAt(controlsState.cameraLookAtLerp);
    }
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

    speed.multiplyScalar((altitude * altitude * 3) + 1);
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
