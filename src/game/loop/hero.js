import * as THREE from 'three';
import { DirMode } from '../actors.ts';
import { AnimType } from '../data/animType';

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

export function updateHero(game, scene, hero, time) {
    if (hero.props.dirMode !== DirMode.MANUAL)
        return;
    const behaviour = game.getState().hero.behaviour;
    handleBehaviourChanges(hero, behaviour);
    processActorMovement(game.controlsState, scene, hero, time, behaviour);
}

function handleBehaviourChanges(hero, behaviour) {
    if (hero.props.entityIndex !== behaviour) {
        hero.props.entityIndex = behaviour;
        toggleJump(hero, false);
        hero.resetAnimState();
    }
}

function toggleJump(hero, value) {
    hero.props.runtimeFlags.isJumping = value;
    hero.props.runtimeFlags.isWalking = value;
    // check in the original game how this is actually set
    hero.props.runtimeFlags.hasGravityByAnim = value;
}

function processActorMovement(controlsState, scene, hero, time, behaviour) {
    let animIndex = hero.props.animIndex;
    if (hero.props.runtimeFlags.isJumping && hero.animState.hasEnded) {
        toggleJump(hero, false);
    }
    if (!hero.props.runtimeFlags.isJumping) {
        toggleJump(hero, false);
        animIndex = AnimType.NONE;
        if (controlsState.controlVector.y !== 0) {
            hero.props.runtimeFlags.isWalking = true;
            animIndex = controlsState.controlVector.y === 1 ? AnimType.FORWARD : AnimType.BACKWARD;
            if (controlsState.sideStep === 1) {
                animIndex = controlsState.controlVector.y === 1 ?
                    AnimType.DODGE_FORWARD : AnimType.DODGE_BACKWARD;
            }
        }
        if (controlsState.jump === 1) {
            toggleJump(hero, true);
            animIndex = AnimType.JUMP;
            if (controlsState.controlVector.y === 1) {
                animIndex = AnimType.RUNNING_JUMP;
            }
        }
        if (controlsState.fight === 1) {
            hero.props.runtimeFlags.isWalking = true;
            if (!hero.props.runtimeFlags.isFighting) {
                animIndex = AnimType.PUNCH_1 + Math.floor(Math.random() * 3);
                hero.props.runtimeFlags.repeatHit = Math.floor(Math.random() * 2);
                hero.props.runtimeFlags.isFighting = true;
            } else {
                if (hero.animState.hasEnded) {
                    if (!hero.props.runtimeFlags.isSwitchingHit) {
                        if (hero.props.runtimeFlags.repeatHit <= 0) {
                            animIndex = AnimType.PUNCH_1 + Math.floor(Math.random() * 3);
                            while (animIndex === hero.props.animIndex) {
                                animIndex = AnimType.PUNCH_1 + Math.floor(Math.random() * 3);
                            }
                            hero.props.runtimeFlags.repeatHit = Math.floor(Math.random() * 2);
                        } else {
                            hero.props.runtimeFlags.repeatHit -= 1;
                            animIndex = hero.props.animIndex;
                        }
                        hero.props.runtimeFlags.isSwitchingHit = true;
                    } else {
                        animIndex = hero.props.animIndex;
                    }
                } else {
                    animIndex = hero.props.animIndex;
                    hero.props.runtimeFlags.isSwitchingHit = false;
                }
            }
        } else {
            hero.props.runtimeFlags.isFighting = false;
        }
        if (controlsState.crouch === 1) {
            hero.props.runtimeFlags.isCrouching = true;
        } else if (controlsState.controlVector.y !== 0 || controlsState.controlVector.x !== 0) {
            hero.props.runtimeFlags.isCrouching = false;
        }
        if (hero.props.runtimeFlags.isCrouching) {
            animIndex = AnimType.CROUCH;
        }
        if (controlsState.weapon === 1) {
            animIndex = AnimType.THROW;
        }
    }
    if (controlsState.controlVector.x !== 0 && !controlsState.crouch) {
        toggleJump(hero, false);
        hero.props.runtimeFlags.isCrouching = false;
        hero.props.runtimeFlags.isWalking = true;
        if (!controlsState.sideStep) {
            const euler = new THREE.Euler();
            euler.setFromQuaternion(hero.physics.orientation, 'YXZ');
            euler.y -= controlsState.controlVector.x * time.delta * 1.2;
            hero.physics.temp.angle = euler.y;
            if (controlsState.controlVector.y === 0) {
                animIndex = controlsState.controlVector.x === 1 ? AnimType.LEFT : AnimType.RIGHT;
            }
            hero.physics.orientation.setFromEuler(euler);
            // hero.props.runtimeFlags.isTurning = true;
        } else {
            animIndex = controlsState.controlVector.x === 1 ?
                AnimType.DODGE_RIGHT : AnimType.DODGE_LEFT;
            if (behaviour === BehaviourMode.ATHLETIC) {
                // for some reason Sportif mode as the animations step inversed
                hero.physics.temp.position.x *= -1;
                hero.physics.temp.position.z *= -1;
                animIndex = controlsState.controlVector.x === 1 ?
                    AnimType.DODGE_LEFT : AnimType.DODGE_RIGHT;
            }
        }
    }
    animIndex = processCamRelativeMovement(controlsState, scene, hero, animIndex);
    if (hero.props.animIndex !== animIndex) {
        hero.props.animIndex = animIndex;
        hero.resetAnimState();
    }
}

function processCamRelativeMovement(controlsState, scene, hero, animIndex) {
    if (controlsState.relativeToCam) {
        const camera = scene.camera.controlNode;
        if (!camera)
            return animIndex;

        const flatCam = new THREE.Object3D();
        flatCam.position.set(camera.position.x, 0, camera.position.z);
        const heroPos = new THREE.Vector3();
        heroPos.applyMatrix4(hero.threeObject.matrixWorld);
        heroPos.y = 0;
        flatCam.lookAt(heroPos);

        const speed = controlsState.controlVector.length();
        const worldAngle = Math.PI / 2;
        if (speed > 0.2) {
            const baseAngle = controlsState.controlVector.angle();
            const q = new THREE.Quaternion();
            q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), baseAngle - worldAngle);
            flatCam.quaternion.multiply(q);
            const euler = new THREE.Euler();
            euler.setFromQuaternion(flatCam.quaternion, 'XZY');
            hero.physics.temp.angle = euler.y;
            hero.physics.orientation = flatCam.quaternion.clone();
            animIndex = AnimType.FORWARD;
            hero.props.runtimeFlags.isWalking = true;
        }
    }
    return animIndex;
}
