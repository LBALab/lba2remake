import * as THREE from 'three';
import Actor, { ActorDirMode, ActorState } from '../Actor';
import { AnimType } from '../data/animType';
import SampleType from '../data/sampleType';
import { LBA2BodyType, LBA1BodyType } from '../data/bodyType';
import { LBA2WeaponToBodyMapping, LBA2Items, LBA1Items, LBA1WeaponToBodyMapping } from '../data/inventory';
import { WORLD_SIZE } from '../../utils/lba';
import { processHit } from './animAction';
import Scene from '../Scene';
import Island from '../scenery/island/Island';
import Game from '../Game';
import { Time } from '../../datatypes';
import { ControlsState } from '../ControlsState';
import { getParams } from '../../params';
import MagicBall, { MagicballStatus } from '../MagicBall';

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

const isLBA1 = getParams().game === 'lba1';

export function updateHero(game: Game, scene: Scene, hero: Actor, time: Time) {
    const behaviour = game.getState().hero.behaviour;
    handleBehaviourChanges(scene, hero, behaviour);
    handleBodyChanges(game, scene, hero);

    if (hero.props.dirMode !== ActorDirMode.MANUAL) {
        if (game.controlsState.firstPerson
            && !hero.scripts.move.context.state.goingToPoint) {
            processFirstPersonsTurning(game, scene);
        }
        return;
    }

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

function handleBodyChanges(game: Game, scene: Scene, hero: Actor) {
    if (hero.props.dirMode !== ActorDirMode.MANUAL) {
        hero.setBody(scene, hero.props.bodyIndex);
        return;
    }

    const body = getBodyFromGameState(game);
    if (body === -1) {
        return;
    }
    hero.setBody(scene, body);

    const equippedItem = game.getState().hero.equippedItemId;
    const drawSwordLBA1 = isLBA1
        && equippedItem === LBA1Items.FUNFROCK_SABER
        && hero.props.bodyIndex !== LBA1WeaponToBodyMapping[equippedItem];
    const drawSwordLBA2 = !isLBA1
        && equippedItem === LBA2Items.SWORD
        && hero.props.bodyIndex !== LBA2WeaponToBodyMapping[equippedItem];

    if (drawSwordLBA1 || drawSwordLBA2) {
        hero.setAnimWithCallback(AnimType.SWORD_DRAW, () => {
            hero.setAnim(AnimType.NONE);
            hero.state.isDrawingSword = false;
        });
        hero.state.isDrawingSword = true;
    }
}

export function getBodyFromGameState(game: Game): number {
    const equippedItem = game.getState().hero.equippedItemId;
    if (equippedItem < 0) {
        // Corner case for when Twinsen hasn't yet picked up the magic ball.
        if (isLBA1) {
            if (game.getState().flags.quest[LBA1Items.SENDELLS_MEDALLION]) {
                return LBA1BodyType.TWINSEN_TUNIC;
            }
            if (game.getState().flags.quest[LBA1Items.TUNIC]) {
                return LBA1BodyType.TWINSEN_TUNIC_NO_MEDALLION;
            }
            // Prison or Nurse bodies are set in script instead
            return -1;
        }
        if (game.getState().flags.quest[LBA2Items.TUNIC]) {
            if (game.getState().flags.inventory[LBA2Items.TUNIC] === 1) {
                return LBA2BodyType.TWINSEN_WIZARD;
            }
            return LBA2BodyType.TWINSEN_TUNIC;
        }
        return LBA2BodyType.TWINSEN_NO_TUNIC;
    }

    if (isLBA1) {
        if (game.getState().flags.quest[LBA1Items.TUNIC]) {
            return LBA1BodyType.TWINSEN_TUNIC_NO_MEDALLION;
        }
        return LBA1WeaponToBodyMapping[equippedItem];
    }

    const body = LBA2WeaponToBodyMapping[equippedItem];
    const tunic = game.getState().flags.quest[LBA2Items.TUNIC];
    const wizard = tunic && game.getState().flags.inventory[LBA2Items.TUNIC] === 1;

    // Special cases.
    if (body === LBA2BodyType.TWINSEN_TUNIC && !tunic) {
        return LBA2BodyType.TWINSEN_NO_TUNIC;
    }
    if (body === LBA2BodyType.TWINSEN_BLOWGUN && wizard) {
        return LBA2BodyType.TWINSEN_WIZARD_BLOWGUN;
    }
    if (body === LBA2BodyType.TWINSEN_TUNIC && wizard) {
        return LBA2BodyType.TWINSEN_WIZARD;
    }

    return body;
}

function handleBehaviourChanges(scene: Scene, hero: Actor, behaviour: number) {
    if (hero.state.isDrowning) {
        return;
    }
    if (hero.props.entityIndex !== behaviour) {
        hero.props.entityIndex = behaviour;
        hero.reloadModel(scene);
        toggleJump(hero, false);
    }
}

// validPosition returns true iff Twinsen is in a position we consider "valid",
// that is one where he's stood on ground and not doing anything interesting
// (e.g. climbing or jumping).
function validPosition(state: ActorState) {
    const onFloor = state.isTouchingGround ||
                    state.isTouchingFloor;
    return onFloor
        && !state.isDrowning
        && !state.isDrowningLava
        && !state.isDrowningStars
        && !state.isJumping
        && !state.isFalling
        && !state.isClimbing
        && !state.isSliding
        && !state.isStuck;
}

function toggleJump(hero: Actor, value: boolean) {
    hero.state.isJumping = value;
    hero.state.isWalking = value;
    if (value) {
        hero.state.isSliding = false;
        hero.state.isStuck = false;
    }
    // check in the original game how this is actually set
    hero.state.hasGravityByAnim = value;
    if (value) {
        hero.state.jumpStartHeight = hero.threeObject.position.y;
    }
}

let turnReset = true;
const BASE_ANGLE = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
const Q = new THREE.Quaternion();
const EULER = new THREE.Euler();

function processFirstPersonsTurning(game: Game, scene: Scene) {
    const controlsState = game.controlsState;
    if (Math.abs(controlsState.altControlVector.x) > 0.6 && turnReset) {
        EULER.setFromQuaternion(scene.camera.controlNode.quaternion, 'YXZ');
        EULER.y -= Math.sign(controlsState.altControlVector.x) * Math.PI / 8;
        scene.camera.controlNode.quaternion.setFromEuler(EULER);
        turnReset = false;
    } else if (Math.abs(controlsState.altControlVector.x) < 0.3) {
        turnReset = true;
    }
}

function processFirstPersonsMovement(game: Game, scene: Scene, hero: Actor, time: Time) {
    const controlsState = game.controlsState;
    if (hero.state.isClimbing ||
        hero.state.isSearching ||
        hero.state.isSliding) {
        return;
    }
    if (hero.state.isHit) {
        // Ensure we fall backwards.
        hero.state.isWalking = true;
        return;
    }

    let animIndex = hero.props.animIndex;
    if (hero.state.isJumping &&
        (hero.animState.hasEnded || controlsState.cancelJump)) {
        toggleJump(hero, false);
    }
    if (!hero.state.isJumping) {
        toggleJump(hero, false);
        if (hero.state.isFalling) {
            processFall(scene, hero);
            return;
        }
        let distFromFloor = hero.state.distFromGround;
        if (scene.scenery instanceof Island) {
            distFromFloor = scene.scenery.physics.getDistFromFloor(scene, hero);
        }
        // We don't trigger a fall if Twinsen is using the Jetpack, (but we do
        // for the protopack).
        const usingJetpack = hero.props.entityIndex === BehaviourMode.JETPACK &&
                             hero.props.animIndex === AnimType.FORWARD;
        if (distFromFloor >= SMALL_FALL_HEIGHT && !usingJetpack) {
            hero.state.isFalling = true;
            hero.state.fallDistance = distFromFloor;
            hero.setAnim(AnimType.FALLING);
            return;
        }
        if (checkDrowningAnim(game, scene, hero, time)) {
            return;
        }

        if (controlsState.controlVector.y === 0 &&
            (hero.props.entityIndex === BehaviourMode.JETPACK ||
             hero.props.entityIndex === BehaviourMode.PROTOPACK)) {
            hero.stopSample(SampleType.JETPACK);
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
        processFirstPersonsTurning(game, scene);
        if (controlsState.jump === 1) {
            toggleJump(hero, true);
            animIndex = AnimType.JUMP;
            if (!isLBA1 && Math.abs(controlsState.controlVector.y) > 0.6) {
                animIndex = AnimType.RUNNING_JUMP;
            }
        }
    }
    firstPersonMagicball(game, scene, time);
    if (!hero.state.isJumping) {
        const threeCamera = scene.camera.threeCamera;
        Q.setFromRotationMatrix(threeCamera.matrixWorld);
        Q.multiply(BASE_ANGLE);
        EULER.setFromQuaternion(Q, 'YXZ');
        EULER.x = 0;
        EULER.z = 0;
        hero.physics.orientation.setFromEuler(EULER);
        hero.physics.temp.angle = EULER.y;
    }
    if (hero.props.animIndex !== animIndex) {
        hero.props.animIndex = animIndex;
    }
}

// Keep track of who we've punched per hand to ensure the player pulls their
// hand back before we let them trigger another punch.
const punched = {};
const ACTOR_BOX = new THREE.Box3();
const PUNCH_VELOCITY_THRESHOLD = 300;

// firstPersonPunching checks to see if the player has punched an actor with
// their fists (VR controller).
function firstPersonPunching(game: Game, scene: Scene) {
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
                processHit(scene.actors[0], game.getState().hero.handStrength, scene);
                punched[a.index][i] = true;
            } else if (!intersect) {
                punched[a.index][i] = false;
            }
        }
    }
}

const THROW_SPEED_THRESHOLD = 0.3;
const THROW_FORCE_MULTIPLIER = 3;

let savedPosIdx = -1;
const LAST_POS = new THREE.Vector3();
const MOMENTUM = new THREE.Vector3();
const TGT_BALL_POSITION = new THREE.Vector3;
const BALL_POSITION = new THREE.Vector3;

/**
 * Checks if the magiball is being held and thrown with
 * the VR controllers in first person.
 */
function firstPersonMagicball(game: Game, scene: Scene, time: Time) {
    const hasMagicball =
        (isLBA1 && game.getState().flags.quest[LBA1Items.MAGIC_BALL] === 1) ||
        (!isLBA1 && game.getState().flags.quest[LBA2Items.MAGIC_BALL] === 1);
    if (!hasMagicball) {
        return;
    }
    if (game.controlsState.weapon === 1) {
        const posIdx = game.controlsState.vrWeaponControllerIndex;
        const handPositions = game.controlsState.vrControllerPositions;
        const handRotations = game.controlsState.vrControllerRotations;
        const handSide = game.controlsState.vrHandSide;

        // Place ball in scene
        const sign = handSide[posIdx] === 'left' ? 1 : -1;
        TGT_BALL_POSITION.set(sign * 0.15, -0.08, -0.08); // offset relative to hand
        TGT_BALL_POSITION.applyQuaternion(handRotations[posIdx]);
        TGT_BALL_POSITION.add(handPositions[posIdx]);
        TGT_BALL_POSITION.sub(scene.sceneNode.position);
        if (MagicBall.instance.status === MagicballStatus.IDLE || savedPosIdx !== posIdx) {
            // Reset momentum when making the ball appear or switching hands
            MOMENTUM.set(0, 0, 0);
            if (MagicBall.instance.status === MagicballStatus.IDLE) {
                BALL_POSITION.copy(TGT_BALL_POSITION);
            }
            LAST_POS.copy(BALL_POSITION);
            MagicBall.instance.init(game, scene);
        } else {
            // Lerp formula inspired by:
            // https://www.construct.net/en/blogs/ashleys-blog-2/using-lerp-delta-time-924
            BALL_POSITION.lerp(TGT_BALL_POSITION, 1 - Math.pow(0.0005, time.delta));

            // Update the ball's momentum
            MOMENTUM.copy(BALL_POSITION);
            MOMENTUM.sub(LAST_POS);
            MOMENTUM.divideScalar(time.delta);

            LAST_POS.copy(BALL_POSITION);
        }

        MagicBall.instance.setPosition(BALL_POSITION);
        savedPosIdx = posIdx;
    } else if (MagicBall.instance.status === MagicballStatus.HOLDING_IN_HAND) {
        if (MOMENTUM.length() > THROW_SPEED_THRESHOLD) {
            MOMENTUM.multiplyScalar(THROW_FORCE_MULTIPLIER);
            MagicBall.instance.throwTowards(MOMENTUM);
        } else {
            MagicBall.instance.reset(true);
        }
    }
}

// From this height Twinsen dies.
const BIG_FALL_HEIGHT = 3;
// From this height Twinsen hits his head on the floor.
const MEDIUM_FALL_HEIGHT = 2;
// From this height Twinsen just stumbles a bit.
const SMALL_FALL_HEIGHT = 0.3;

function processFall(scene: Scene, hero: Actor) {
    let distFromFloor = hero.state.distFromFloor;
    if (scene.scenery instanceof Island) {
        distFromFloor = scene.scenery.physics.getDistFromFloor(scene, hero);
    }
    if (distFromFloor < 0.001) {
        // If we've jumped into water, don't play the landing animation.
        if (hero.state.isDrowning
            || hero.state.isDrowningLava
            || hero.state.isDrowningStars) {
            hero.state.isFalling = false;
            hero.state.fallDistance = 0;
            return;
        }
        let animIndex = 0;
        if (hero.state.fallDistance >= SMALL_FALL_HEIGHT
         && hero.state.fallDistance < MEDIUM_FALL_HEIGHT) {
            animIndex = AnimType.FALL_LANDING_STUMBLE;
        }

        if (hero.state.fallDistance >= MEDIUM_FALL_HEIGHT
         && hero.state.fallDistance < BIG_FALL_HEIGHT) {
            // TODO(scottwilliams): Do some damage to Twinsen.
            animIndex = AnimType.FALL_LANDING_HEAD_HIT;
        }
        if (hero.state.fallDistance >= BIG_FALL_HEIGHT) {
            // TODO(scottwilliams): Replace this with the dying animation once
            // we have the ability to die properly.
            animIndex = AnimType.FALL_LANDING_HEAD_HIT;
        }
        hero.setAnimWithCallback(animIndex, () => {
            hero.state.isFalling = false;
            hero.state.fallDistance = 0;
        });
    }
}

function processActorMovement(
    game: Game,
    scene: Scene,
    hero: Actor,
    time: Time,
    behaviour: number
) {
    const controlsState = game.controlsState;
    if (hero.state.isClimbing ||
        hero.state.isSearching ||
        hero.state.isSliding) {
        return;
    }
    if (hero.state.isHit) {
        // Ensure we fall backwards.
        hero.state.isWalking = true;
        return;
    }

    let animIndex = hero.props.animIndex;
    if (hero.state.isJumping &&
        (hero.animState.hasEnded || controlsState.cancelJump)) {
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
        if (usingProtopack && !scene.props.isIsland) {
            fallThreshold = 0.5;
        }
        if (usingJetpack) {
            fallThreshold = Infinity;
        }
        if (hero.state.distFromFloor >= fallThreshold) {
            hero.state.isFalling = true;
            hero.state.fallDistance = hero.state.distFromFloor;
            hero.setAnim(AnimType.FALLING);
            return;
        }
        if (checkDrowningAnim(game, scene, hero, time)) {
            return;
        }

        if (controlsState.controlVector.y === 0 &&
            (hero.props.entityIndex === BehaviourMode.JETPACK ||
             hero.props.entityIndex === BehaviourMode.PROTOPACK)) {
            hero.stopSample(SampleType.JETPACK);
        }

        animIndex = AnimType.NONE;
        if (!controlsState.relativeToCam && controlsState.controlVector.y !== 0) {
            hero.state.isWalking = true;
            animIndex = controlsState.controlVector.y === 1 ? AnimType.FORWARD : AnimType.BACKWARD;
            if (!isLBA1 && controlsState.sideStep === 1) {
                animIndex = controlsState.controlVector.y === 1 ?
                    AnimType.DODGE_FORWARD : AnimType.DODGE_BACKWARD;
            }
        }
        if (controlsState.jump === 1) {
            toggleJump(hero, true);
            animIndex = AnimType.JUMP;
            if (!isLBA1 && !controlsState.relativeToCam && controlsState.controlVector.y === 1) {
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
            if (isLBA1) {
                switch (game.getState().hero.equippedItemId) {
                    case LBA1Items.MAGIC_BALL:
                        animIndex = AnimType.THROW;
                        break;
                    case LBA1Items.FUNFROCK_SABER:
                        hero.state.isWalking = true;
                        animIndex = AnimType.SWORD_ATTACK;
                        break;
                }
            } else {
                switch (game.getState().hero.equippedItemId) {
                    case LBA1Items.MAGIC_BALL:
                    case LBA2Items.MAGIC_BALL:
                        animIndex = AnimType.THROW;
                        break;
                    case LBA2Items.DARTS:
                        if (game.getState().flags.quest[LBA2Items.DARTS] <= 0) {
                            if (game.getState().flags.quest[LBA2Items.MAGIC_BALL] === 1) {
                                game.getState().hero.equippedItemId = LBA2Items.MAGIC_BALL;
                            } else {
                                game.getState().hero.equippedItemId = -1;
                            }
                        } else {
                            animIndex = AnimType.THROW_DART;
                        }
                        break;
                    case LBA2Items.BLOWGUN:
                        animIndex = AnimType.BLOWGUN_SHOOT;
                        break;
                    case LBA2Items.WANNIE_GLOVE:
                        animIndex = AnimType.WANNIE_GLOVE_SWING;
                        break;
                    case LBA2Items.LASER_PISTOL:
                        animIndex = AnimType.LASTER_PISTOL_SHOOT;
                        break;
                    case LBA1Items.FUNFROCK_SABER:
                    case LBA2Items.SWORD:
                        hero.state.isWalking = true;
                        animIndex = AnimType.SWORD_ATTACK;
                        break;
                }
            }
            if (hero.props.entityIndex === BehaviourMode.HORN) {
                animIndex = AnimType.THROW;
            }
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
                    const rotationSpeed =
                        (isLBA1 || hero.props.entityIndex === BehaviourMode.DISCRETE) ? 65 : 24;
                    const rotY = (hero.animState.rotation.y * rotationSpeed) / WORLD_SIZE;
                    euler.y += rotY * time.delta;
                } else {
                    euler.y -= controlsState.controlVector.x * time.delta * 2.0;
                }
                hero.physics.orientation.setFromEuler(euler);
                // hero.state.isTurning = true;
            } else if (!isLBA1) {
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
    // Don't cancel the drawing sword animation if it's playing.
    if (hero.state.isDrawingSword && animIndex === AnimType.NONE) {
        return;
    }
    hero.setAnim(animIndex);
}

function checkDrowningAnim(game: Game, scene: Scene, hero: Actor, time: Time) {
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
    });
    return true;
}

const FLAT_CAM = new THREE.Object3D();
const HERO_POS = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const QUAT = new THREE.Quaternion();

function processCamRelativeMovement(
    controlsState: ControlsState,
    scene: Scene,
    hero: Actor,
    animIndex: number
) {
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

export function heroUseItem(game: Game, rawItemId: number, itemId?: number) {
    if (!itemId) {
        itemId = rawItemId;
    }

    // Use the raw item ID here as it will be passed to scripts.
    game.getState().hero.usingItemId = rawItemId;

    // Reset the usingItemId after a single game loop execution.
    game.addLoopFunction(null, () => {
        game.getState().hero.usingItemId = -1;
    });

    if (itemId in LBA2WeaponToBodyMapping) {
        // Use the mapped item ID here as it affects Twinsen's model.
        game.getState().hero.equippedItemId = itemId;
    }
}
