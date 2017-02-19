import THREE from 'three';
import {map, each} from 'lodash';

export function processPhysicsFrame(game, renderer, scene, time) {
    processHeroMovement(game.controlsState, scene, time);
    processCameraMovement(game.controlsState, renderer, scene, time);
}

const orientedSpeed = new THREE.Vector3();
const euler = new THREE.Euler();
const q = new THREE.Quaternion();

function processHeroMovement(controlsState, scene, time) {
    const actor = scene.getActor(0);
    if (controlsState.heroRotationSpeed != 0) {
        euler.setFromQuaternion(actor.physics.orientation, 'YXZ');
        euler.y += controlsState.heroRotationSpeed * time.delta * 1.2;
        actor.physics.orientation.setFromEuler(euler);
    }
    if (controlsState.heroSpeed != 0) {
        orientedSpeed.set(0, 0, controlsState.heroSpeed * 0.05);
        orientedSpeed.applyQuaternion(actor.physics.orientation);
        orientedSpeed.multiplyScalar(time.delta);
        actor.physics.position.add(orientedSpeed);
        actor.physics.position.y = scene.scenery.physics.getGroundHeight(actor.physics.position.x, actor.physics.position.z);
    }
}

function processCameraMovement(controlsState, renderer, scene, time) {
    if (controlsState.freeCamera) {
        if (scene.isIsland) {
            processFreeCamera3DMovement(controlsState, renderer.cameras.camera3D, scene, time);
        }
    }
}

function processFreeCamera3DMovement(controlsState, camera, scene, time) {
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

function onlyY(src) {
    euler.setFromQuaternion(src, 'YXZ');
    euler.x = 0;
    euler.z = 0;
    return q.setFromEuler(euler);
}
