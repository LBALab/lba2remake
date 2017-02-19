import THREE from 'three';

export function processPhysicsFrame(game, scene, time) {
    processHeroMovement(game.controlsState, scene, time);
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
        //actor.physics.position.y = scene.scenery.physics.getGroundHeight(actor.physics.position.x, actor.physics.position.z);
    }
}


