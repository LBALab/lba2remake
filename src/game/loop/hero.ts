import * as THREE from 'three';
import { DirMode } from '../Actor';
import { AnimType } from '../data/animType';
import { WORLD_SIZE } from '../../utils/lba';
import { processHit } from './animAction';
import Scene from '../Scene';
import Island from '../scenery/island/Island';

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
    handleBehaviourChanges(scene, hero, behaviour);
    if (game.controlsState.firstPerson) {
        processFirstPersonsMovement(game, scene, hero, time);
    } else {
        processActorMovement(game, scene, hero, time, behaviour);
    }

    // Only save a valid position at most once every 500ms.
    const timeSinceLastPosSave = performance.now() - game.getState().hero.lastValidPosTime;
    if (validPosition(hero.state) && timeSinceLastPosSave > 500) {
        scene.savedState = game.getState().save(hero);
        game.getState().hero.lastValidPosTime = performance.now();
    }
}

function handleBehaviourChanges(scene, hero, behaviour) {
    if (hero.state.isDrowning) {
        return;
    }
    if (hero.props.entityIndex !== behaviour) {
        hero.props.entityIndex = behaviour;
        hero.reloadModel(scene);
        toggleJump(hero, false);
        hero.resetAnimState();
    }
}

// validPosition returns true iff Twinsen is in a position we consider "valid",
// that is one where he's stood on ground and not doing anything interesting
// (e.g. climbing or jumping).
function validPosition(state) {
    const onFloor = state.isTouchingGround ||
                    state.isTouchingFloor;
    return onFloor
        && !state.isDrowning
        && !state.isDrowningLava
        && !state.isDrowningStars
        && !state.isJumping
        && !state.isFalling
        && !state.isClimbing;
}

function toggleJump(hero, value) {
    hero.state.isJumping = value;
    hero.state.isWalking = value;
    // check in the original game how this is actually set
    hero.state.hasGravityByAnim = value;
}

let turnReset = true;
const BASE_ANGLE = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
const Q = new THREE.Quaternion();
const EULER = new THREE.Euler();

function processFirstPersonsMovement(game, scene: Scene, hero, time) {
    const controlsState = game.controlsState;
    if (hero.state.isClimbing ||
        hero.state.isSearching) {
        return;
    }
    if (hero.state.isHit) {
        // Ensure we fall backwards.
        hero.state.isWalking = true;
        return;
    }

    let animIndex = hero.props.animIndex;
    if (hero.state.isJumping && hero.animState.hasEnded) {
        toggleJump(hero, false);
    }
    if (!hero.state.isJumping) {
        toggleJump(hero, false);
        if (hero.state.isFalling) {
            processFall(scene, hero);
            return;
        }
        let distFromFloor = hero.props.distFromGround;
        if (scene.scenery instanceof Island) {
            distFromFloor = scene.scenery.physics.getDistFromFloor(scene, hero);
        }
        // We don't trigger a fall if Twinsen is using the Jetpack, (but we do
        // for the protopack).
        const usingJetpack = hero.props.entityIndex === BehaviourMode.JETPACK &&
                             hero.props.animIndex === AnimType.FORWARD;
        if (distFromFloor >= SMALL_FALL_HEIGHT && !usingJetpack) {
            hero.state.isFalling = true;
            hero.props.fallDistance = distFromFloor;
            hero.setAnim(AnimType.FALLING);
            return;
        }
        if (checkDrowningAnim(game, scene, hero, time)) {
            return;
        }

        if (hero.props.entityIndex === BehaviourMode.AGGRESSIVE) {
            firstPersonPunching(game, scene);
        }

        animIndex = AnimType.NONE;
        if (Math.abs(controlsState.controlVector.y) > 0.6) {
            hero.state.isWalking = true;
            animIndex = controlsState.controlVector.y > 0 ? AnimType.FORWARD : AnimType.BACKWARD;
        } else if (Math.abs(controlsState.controlVector.x) > 0.7) {
            hero.state.isWalking = true;
            animIndex = controlsState.controlVector.x > 0
                ? AnimType.DODGE_LEFT
                : AnimType.DODGE_RIGHT;
        } else {
            hero.state.isWalking = false;
        }
        if (Math.abs(controlsState.altControlVector.x) > 0.6 && turnReset) {
            const euler = new THREE.Euler();
            euler.setFromQuaternion(scene.camera.controlNode.quaternion, 'YXZ');
            euler.y -= Math.sign(controlsState.altControlVector.x) * Math.PI / 8;
            scene.camera.controlNode.quaternion.setFromEuler(euler);
            turnReset = false;
        } else if (Math.abs(controlsState.altControlVector.x) < 0.3) {
            turnReset = true;
        }
        if (controlsState.jump === 1) {
            toggleJump(hero, true);
            animIndex = AnimType.JUMP;
            if (Math.abs(controlsState.controlVector.y) > 0.6) {
                animIndex = AnimType.RUNNING_JUMP;
            }
        }
    }
    if (!hero.state.isJumping) {
        const threeCamera = scene.camera.threeCamera;
        Q.setFromRotationMatrix(threeCamera.matrixWorld);
        Q.multiply(BASE_ANGLE);
        const orientation = onlyY(Q);
        EULER.setFromQuaternion(orientation, 'YXZ');
        hero.physics.orientation.setFromEuler(EULER);
        hero.physics.temp.angle = EULER.y;
    }
    if (hero.props.animIndex !== animIndex) {
        hero.props.animIndex = animIndex;
        hero.resetAnimState();
    }
}

// Keep track of who we've punched per hand to ensure the player pulls their
// hand back before we let them trigger another punch.
const punched = {};
const ACTOR_BOX = new THREE.Box3();
const PUNCH_VELOCITY_THRESHOLD = 300;

// firstPersonPunching checks to see if the player has punched an actor with
// their fists (VR controller).
function firstPersonPunching(game, scene) {
    for (const a of scene.actors) {
        if (a.index === 0 || !a.model) {
            continue;
        }

        if (!punched[a.index]) {
            punched[a.index] = {};
        }

        ACTOR_BOX.copy(a.model.boundingBox);
        ACTOR_BOX.translate(a.physics.position);
        ACTOR_BOX.applyMatrix4(scene.sceneNode.matrixWorld);
        const handPositions = game.controlsState.vrControllerPositions;
        for (let i = 0; i < handPositions.length; i += 1) {
            const intersect = ACTOR_BOX.containsPoint(handPositions[i]);
            const velocity = game.controlsState.vrControllerVelocities[i];
            if (intersect && velocity > PUNCH_VELOCITY_THRESHOLD && !punched[a.index][i]) {
                processHit(scene.actors[0], game.getState().hero.handStrength, game, scene);
                punched[a.index][i] = true;
            } else if (!intersect) {
                punched[a.index][i] = false;
            }
        }
    }
}

// From this height Twinsen dies.
const BIG_FALL_HEIGHT = 3;
// From this height Twinsen hits his head on the floor.
const MEDIUM_FALL_HEIGHT = 2;
// From this height Twinsen just stumbles a bit.
const SMALL_FALL_HEIGHT = 0.3;

function processFall(scene: Scene, hero) {
    let distFromFloor = hero.props.distFromGround;
    if (scene.scenery instanceof Island) {
        distFromFloor = scene.scenery.physics.getDistFromFloor(scene, hero);
    }
    if (distFromFloor < 0.001) {
        // If we've jumped into water, don't play the landing animation.
        if (hero.state.isDrowning
            || hero.state.isDrowningLava
            || hero.state.isDrowningStars) {
            hero.state.isFalling = false;
            hero.props.fallDistance = 0;
            return;
        }
        let animIndex = 0;
        if (hero.props.fallDistance >= SMALL_FALL_HEIGHT
         && hero.props.fallDistance < MEDIUM_FALL_HEIGHT) {
            animIndex = AnimType.FALL_LANDING_STUMBLE;
        }

        if (hero.props.fallDistance >= MEDIUM_FALL_HEIGHT
         && hero.props.fallDistance < BIG_FALL_HEIGHT) {
            // TODO(scottwilliams): Do some damage to Twinsen.
            animIndex = AnimType.FALL_LANDING_HEAD_HIT;
        }
        if (hero.props.fallDistance >= BIG_FALL_HEIGHT) {
            // TODO(scottwilliams): Replace this with the dying animation once
            // we have the ability to die properly.
            animIndex = AnimType.FALL_LANDING_HEAD_HIT;
        }
        hero.setAnimWithCallback(animIndex, () => {
            hero.state.isFalling = false;
            hero.props.fallDistance = 0;
            hero.props.noInterpolateNext = true;
        });
        hero.animState.noInterpolate = true;
    }
}

function processActorMovement(game, scene, hero, time, behaviour) {
    const controlsState = game.controlsState;
    if (hero.state.isClimbing ||
        hero.state.isSearching) {
        return;
    }
    if (hero.state.isHit) {
        // Ensure we fall backwards.
        hero.state.isWalking = true;
        return;
    }

    let animIndex = hero.props.animIndex;
    if (hero.state.isJumping && hero.animState.hasEnded) {
        toggleJump(hero, false);
    }
    if (!hero.state.isJumping) {
        toggleJump(hero, false);
        if (hero.state.isFalling) {
            processFall(scene, hero);
            return;
        }

        const usingJetpack = hero.props.entityIndex === BehaviourMode.JETPACK &&
                             hero.props.animIndex === AnimType.FORWARD;
        const usingProtopack = hero.props.entityIndex === BehaviourMode.PROTOPACK &&
                             hero.props.animIndex === AnimType.FORWARD;
        let fallThreshold = SMALL_FALL_HEIGHT;
        if (usingProtopack && !scene.data.isIsland) {
            fallThreshold = 0.5;
        }
        if (usingJetpack) {
            fallThreshold = Infinity;
        }
        if (hero.props.distFromFloor >= fallThreshold) {
            hero.state.isFalling = true;
            hero.props.fallDistance = hero.props.distFromFloor;
            hero.setAnim(AnimType.FALLING);
            return;
        }
        if (checkDrowningAnim(game, scene, hero, time)) {
            return;
        }

        animIndex = AnimType.NONE;
        if (!controlsState.relativeToCam && controlsState.controlVector.y !== 0) {
            hero.state.isWalking = true;
            animIndex = controlsState.controlVector.y === 1 ? AnimType.FORWARD : AnimType.BACKWARD;
            if (controlsState.sideStep === 1) {
                animIndex = controlsState.controlVector.y === 1 ?
                    AnimType.DODGE_FORWARD : AnimType.DODGE_BACKWARD;
            }
        }
        if (controlsState.jump === 1) {
            toggleJump(hero, true);
            animIndex = AnimType.JUMP;
            if (!controlsState.relativeToCam && controlsState.controlVector.y === 1) {
                animIndex = AnimType.RUNNING_JUMP;
            }
        }
        if (controlsState.fight === 1) {
            hero.state.isWalking = true;
            if (!hero.state.isFighting) {
                animIndex = AnimType.PUNCH_1 + Math.floor(Math.random() * 3);
                hero.state.repeatHit = Math.floor(Math.random() * 2);
                hero.state.isFighting = true;
            } else {
                if (hero.animState.hasEnded) {
                    if (!hero.state.isSwitchingHit) {
                        if (hero.state.repeatHit <= 0) {
                            animIndex = AnimType.PUNCH_1 + Math.floor(Math.random() * 3);
                            while (animIndex === hero.props.animIndex) {
                                animIndex = AnimType.PUNCH_1 + Math.floor(Math.random() * 3);
                            }
                            hero.state.repeatHit = Math.floor(Math.random() * 2);
                        } else {
                            hero.state.repeatHit -= 1;
                            animIndex = hero.props.animIndex;
                        }
                        hero.state.isSwitchingHit = true;
                    } else {
                        animIndex = hero.props.animIndex;
                    }
                } else {
                    animIndex = hero.props.animIndex;
                    hero.state.isSwitchingHit = false;
                }
            }
        } else {
            hero.state.isFighting = false;
        }
        if (controlsState.crouch === 1) {
            hero.state.isCrouching = true;
        } else if (controlsState.controlVector.y !== 0 || controlsState.controlVector.x !== 0) {
            hero.state.isCrouching = false;
        }
        if (hero.state.isCrouching) {
            animIndex = AnimType.CROUCH;
        }
        if (controlsState.weapon === 1) {
            animIndex = AnimType.THROW;
        }
    }

    if (!controlsState.relativeToCam && !hero.state.isJumping) {
        if (controlsState.controlVector.x !== 0 && !controlsState.crouch) {
            hero.state.isCrouching = false;
            hero.state.isWalking = true;
            if (!controlsState.sideStep) {
                const euler = new THREE.Euler();
                euler.setFromQuaternion(hero.physics.orientation, 'YXZ');
                if (euler.y < 0) {
                    euler.y += 2 * Math.PI;
                }
                hero.physics.temp.angle = euler.y;
                if (controlsState.controlVector.y === 0) {
                    animIndex = controlsState.controlVector.x === 1
                        ? AnimType.RIGHT
                        : AnimType.LEFT;
                    let dy = 0;
                    if (hero.animState.keyframeLength) {
                        const rotationSpeed = hero.props.entityIndex === BehaviourMode.DISCRETE
                            ? 65
                            : hero.props.speed;
                        const rotY = (hero.animState.rotation.y * rotationSpeed) / WORLD_SIZE;
                        dy = (rotY * time.delta * 1000) / hero.animState.keyframeLength;
                    }
                    euler.y += dy;
                } else {
                    euler.y -= controlsState.controlVector.x * time.delta * 2.0;
                }
                hero.physics.orientation.setFromEuler(euler);
                // hero.state.isTurning = true;
            } else {
                animIndex = controlsState.controlVector.x === 1
                    ? AnimType.DODGE_LEFT
                    : AnimType.DODGE_RIGHT;
                if (behaviour === BehaviourMode.ATHLETIC) {
                    // for some reason Sportif mode as the animations step inversed
                    hero.physics.temp.position.x *= -1;
                    hero.physics.temp.position.z *= -1;
                    animIndex = controlsState.controlVector.x === 1
                        ? AnimType.DODGE_RIGHT
                        : AnimType.DODGE_LEFT;
                }
            }
        }
    }
    if (!hero.state.isJumping) {
        animIndex = processCamRelativeMovement(controlsState, scene, hero, animIndex);
    }
    hero.setAnim(animIndex);
    if (hero.props.noInterpolateNext) {
        hero.animState.noInterpolate = true;
        hero.props.noInterpolateNext = false;
    }
}

function checkDrowningAnim(game, scene, hero, time) {
    if (!hero.state.isDrowning &&
        !hero.state.isDrowningLava &&
        !hero.state.isDrowningStars) {
      return false;
    }

    let anim = AnimType.DROWNING;
    if (hero.state.isDrowningLava) {
        anim = AnimType.DROWNING_LAVA;
    } else if (hero.state.isDrowningStars) {
        if (game.controlsState.firstPerson) {
            hero.setAnim(AnimType.FALLING);
            if (hero.physics.position.y < 0) {
                const fallSpeed = hero.physics.position.y * 0.18 - 1;
                hero.physics.position.y += fallSpeed * 0.25 * WORLD_SIZE * time.delta;
            } else {
                hero.physics.position.y -= 0.25 * WORLD_SIZE * time.delta;
            }
            if (hero.physics.position.y < -180) {
                game.getState().load(scene.savedState, hero);
                hero.setAnim(AnimType.NONE);
                hero.props.flags.hasCollisions = true;
                hero.state.isDrowning = false;
                hero.state.isDrowningLava = false;
                hero.state.isDrowningStars = false;
            } else {
                hero.props.flags.hasCollisions = false;
            }
            return true;
        }
        anim = AnimType.DROWNING_STARS;
    }
    hero.setAnimWithCallback(anim, () => {
        game.getState().load(scene.savedState, hero);
        hero.setAnim(AnimType.NONE);
        hero.state.isDrowning = false;
        hero.state.isDrowningLava = false;
        hero.state.isDrowningStars = false;
        hero.props.noInterpolateNext = true;
    });
    hero.animState.noInterpolate = true;
    return true;
}

function onlyY(src) {
    const euler = new THREE.Euler();
    euler.setFromQuaternion(src, 'YXZ');
    euler.x = 0;
    euler.z = 0;
    return new THREE.Quaternion().setFromEuler(euler);
}

const FLAT_CAM = new THREE.Object3D();
const HERO_POS = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const QUAT = new THREE.Quaternion();

function processCamRelativeMovement(controlsState, scene, hero, animIndex) {
    if (controlsState.relativeToCam) {
        const camera = scene.camera.controlNode;
        if (!camera || !hero.threeObject)
            return animIndex;

        FLAT_CAM.position.set(camera.position.x, 0, camera.position.z);
        HERO_POS.set(0, 0, 0);
        HERO_POS.applyMatrix4(hero.threeObject.matrixWorld);
        HERO_POS.y = 0;
        FLAT_CAM.lookAt(HERO_POS);

        const cvLength = controlsState.controlVector.length();
        const worldAngle = Math.PI / 2;
        if (cvLength > 0.4) {
            const baseAngle = controlsState.controlVector.angle();
            QUAT.setFromAxisAngle(UP, baseAngle - worldAngle);
            FLAT_CAM.quaternion.multiply(QUAT);
            EULER.setFromQuaternion(FLAT_CAM.quaternion, 'XZY');
            hero.physics.temp.angle = EULER.y;
            hero.physics.orientation.copy(FLAT_CAM.quaternion);
            animIndex = AnimType.FORWARD;
            hero.state.isWalking = true;
        }
    }
    return animIndex;
}
