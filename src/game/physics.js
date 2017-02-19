import THREE from 'three';

export function processPhysicsFrame(game, scene, time) {
    processHeroMovement(game.controlsState, scene, time);
}

const euler = new THREE.Euler();

function processHeroMovement(controlsState, scene, time) {
    const actor = scene.getActor(0);
    let animIndex = actor.props.animIndex;
    if (controlsState.heroSpeed != 0) {
        actor.isWalking = true;
        animIndex = controlsState.heroSpeed == 1 ? 1 : 2;
    } else {
        actor.isWalking = false;
        animIndex = 0;
    }
    if (controlsState.heroRotationSpeed != 0) {
        euler.setFromQuaternion(actor.physics.orientation, 'YXZ');
        euler.y += controlsState.heroRotationSpeed * time.delta * 1.2;
        actor.physics.temp.angle = euler.y;
        if (controlsState.heroSpeed == 0) {
            animIndex = controlsState.heroRotationSpeed == 1 ? 3 : 4;
        }
        actor.physics.orientation.setFromEuler(euler);
    }
    if (actor.props.animIndex != animIndex) {
        actor.props.animIndex = animIndex;
        actor.resetAnimState();
    }

}


