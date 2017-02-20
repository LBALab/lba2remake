import THREE from 'three';
import {DirMode} from './actors';

export function processMovements(game, scene, time) {
    const hero = scene.getActor(0);
    processActorMovement(hero, game.controlsState, time);
}

function processActorMovement(actor, controlsState, time) {
    if (actor.props.dirMode != DirMode.MANUAL)
        return;
    let animIndex = actor.props.animIndex;
    if (controlsState.heroSpeed != 0) {
        actor.isWalking = true;
        animIndex = controlsState.heroSpeed == 1 ? 1 : 2;
    } else {
        actor.isWalking = false;
        animIndex = 0;
    }
    if (controlsState.heroRotationSpeed != 0) {
        const euler = new THREE.Euler();
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

