import THREE from 'three';
import {DirMode} from '../actors';

export const BehaviourMode = {
    NORMAL: 0,
    ATHLETIC: 1,
    AGGRESSIVE: 2,
    DISCRETE: 3,
    PROTOPACK: 4,
    ZOE: 5,
    HORN: 6,
    SPACESUIT_ISO_NORMAL: 7,
    JETPACK: 8,
    SPACESUIT_ISO_ATHLETIC: 9,
    SPACESUIT_3D_NORMAL: 10,
    SPACESUIT_3D_ATHLETIC: 11,
    BUGGY: 12,
    SKELETON: 13
};

export function updateHero(game, hero, time) {
    if (hero.props.dirMode !== DirMode.MANUAL)
        return;
    const behaviour = game.getState().hero.behaviour;
    handleBehaviourChanges(game, hero, behaviour);
    processActorMovement(game.controlsState, hero, time, behaviour);
}

function handleBehaviourChanges(game, hero, behaviour) {
    if (hero.props.entityIndex !== behaviour) {
        hero.props.entityIndex = behaviour;
        toggleJump(game.controlsState, hero, false);
        hero.resetAnimState();
    }
}

function toggleJump(controlsState, hero, value) {
    controlsState.isJumping = value;
    hero.props.runtimeFlags.hasGravityByAnim = value;
}

function processActorMovement(controlsState, hero, time, behaviour) {
    let animIndex = hero.props.animIndex;
    if (controlsState.isJumping && hero.animState.hasEnded){
        toggleJump(controlsState, hero, false);
    }
    if (!controlsState.isJumping) {
        hero.isWalking = false;
        hero.props.runtimeFlags.hasGravityByAnim = false;
        animIndex = 0;
        if (controlsState.heroSpeed !== 0) {
            hero.isWalking = true;
            animIndex = controlsState.heroSpeed === 1 ? 1 : 2;
            if (controlsState.sideStep === 1) {
                animIndex = controlsState.heroSpeed === 1 ? 42 : 43;
            }
        }
        if (controlsState.jump === 1) {
            toggleJump(controlsState, hero, true);
            hero.isWalking = true;
            hero.props.runtimeFlags.hasGravityByAnim = true; // check in the original game how this is actually set
            animIndex = 14; // jump
            if (controlsState.heroSpeed === 1) {
                animIndex = 25; // jump while running
            }
        }
    }
    if (controlsState.heroRotationSpeed !== 0) {
        toggleJump(controlsState, hero, false);
        if (!controlsState.sideStep) {
            const euler = new THREE.Euler();
            euler.setFromQuaternion(hero.physics.orientation, 'YXZ');
            euler.y += controlsState.heroRotationSpeed * time.delta * 1.2;
            hero.physics.temp.angle = euler.y;
            if (controlsState.heroSpeed === 0) {
                animIndex = controlsState.heroRotationSpeed === 1 ? 3 : 4;
            }
            hero.physics.orientation.setFromEuler(euler);
        } else {
            hero.isWalking = true;
            animIndex = controlsState.heroRotationSpeed === 1 ? 40 : 41;
            if (behaviour === BehaviourMode.ATHLETIC) {
                // for some reason Sportif mode as the animations step inversed
                hero.physics.temp.position.x *= -1;
                hero.physics.temp.position.z *= -1;
                animIndex = controlsState.heroRotationSpeed === 1 ? 41 : 40;
            }
        }
    }
    if (hero.props.animIndex !== animIndex) {
        hero.props.animIndex = animIndex;
        hero.resetAnimState();
    }
}
