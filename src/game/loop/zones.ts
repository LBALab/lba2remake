import * as THREE from 'three';

import Actor, { ActorDirMode } from '../Actor';
import { AnimType } from '../data/animType';
import { SampleType } from '../data/sampleType';
import { angleTo, angleToRad, getRandom, WORLD_SCALE, BRICK_SIZE, getHtmlColor } from '../../utils/lba';
import Extra, { getBonus } from '../Extra';
import Game from '../Game';
import Scene from '../Scene';
import Zone from '../Zone';
import { getParams } from '../../params';
import { Time } from '../../datatypes';

function NOP() { }

export const ZoneOpcode = [
    { opcode: 0, command: 'GOTO_SCENE', handler: GOTO_SCENE },
    { opcode: 1, command: 'CAMERA', handler: NOP },
    { opcode: 2, command: 'SCENERIC', handler: NOP },
    { opcode: 3, command: 'FRAGMENT', handler: NOP },
    { opcode: 4, command: 'BONUS', handler: BONUS },
    { opcode: 5, command: 'TEXT', handler: TEXT },
    { opcode: 6, command: 'LADDER', handler: LADDER },
    { opcode: 7, command: 'CONVEYOR', handler: NOP },
    { opcode: 8, command: 'SPIKE', handler: NOP },
    { opcode: 9, command: 'RAIL', handler: NOP }
];

// Readable Scene IDs. Only those transitions we need zone offsets for are
// listed.
const SCENE_ID_TO_NAME = {
    0: 'TWINSENS_HOUSE',
    1: 'CELLAR',
    40: 'DESERT_ISLAND_TICKET_SHOP',
    60: 'DESERT_ISLAND_TOWN_SQUARE',
    109: 'FRANCO_VILLAGE',
    174: 'FRANCO_NURSERY',
    175: 'FRANCO_ROGER_HOUSE',
};

// Map from (previous zone, target zone) to offset in bricks.
// E.g. ZONE_OFFSET_OVERRIDES[CELLAR][TWINSENS_HOUSE] is the offset we should
// apply when placing Twinsen into the TWINSENS_HOUSE scene when transitioning
// from the CELLAR.
// TODO: There are likely more of these needed.
const ZONE_OFFSET_OVERRIDES = {
    CELLAR: {
        TWINSENS_HOUSE: 1,
    },
    DESERT_ISLAND_TOWN_SQUARE: {
        DESERT_ISLAND_TICKET_SHOP: -1.25,
    },
    FRANCO_VILLAGE: {
        FRANCO_NURSERY: -1.25,
        FRANCO_ROGER_HOUSE: -1.25,
    }
};

export function processZones(game: Game, scene: Scene, time: Time) {
    const hero = scene.actors[0];
    const pos = hero.physics.position.clone();
    pos.y += 0.005;
    for (const zone of scene.zones) {
        if (zone.props.type === 2)
            continue;

        const box = zone.props.box;
        if (pos.x > box.xMin && pos.x < box.xMax &&
            pos.y > box.yMin && pos.y < box.yMax &&
            pos.z > box.zMin && pos.z < box.zMax) {
            const zoneType = ZoneOpcode[zone.props.type];
            if (zoneType !== null && zoneType.handler !== null) {
                if (zoneType.handler(game, scene, zone, hero, time))
                    break;
            }
        }
    }
}

// Returns true iff the angle provided is "facing" an isometric ladder. We only
// consider ladders which are in the north or east direction (because only those
// exist in the game).
function isFacingLadder(angle) {
    return (angle < 0.65 * Math.PI && angle > 0.35 * Math.PI) ||
     (angle > 0.75 * Math.PI || angle < -0.9 * Math.PI);
}

const LADDER_TOP_OUT_DELTA = 1.35;

function LADDER(game: Game, scene: Scene, zone: Zone, hero: Actor, _time: Time) {
    if (hero.state.isToppingOutUp) {
        return false;
    }

    // Only allow Twinsen to climb the ladder if he is walking into it.
    if (!hero.state.isColliding) {
        return false;
    }

    if (hero.state.isUsingProtoOrJetpack) {
        return false;
    }

    // TODO(scottwilliams): work out how to tell if Twinsen is facing ladders
    // at arbitrary angles as happens on islands (vs isometric).
    const facing = isFacingLadder(hero.physics.temp.angle) || scene.props.isIsland;
    if (zone.props.info1 && facing) {
        // Is UP being pressed?
        if (game.controlsState.controlVector.y > 0.6) {
            hero.state.isClimbing = true;
            // Ensure that if Twinsen jumped into the ladder we stop jumping now
            // that we're climbing.
            hero.state.isJumping = false;
            hero.setAnim(AnimType.CLIMB_UP);

            const distFromTop = zone.props.box.yMax - hero.physics.position.y;
            if (distFromTop <= LADDER_TOP_OUT_DELTA) {
                hero.state.isToppingOutUp = true;

                hero.setAnimWithCallback(AnimType.LADDER_TOP_OUT_UP, () => {
                    hero.state.isClimbing = false;
                    hero.state.isToppingOutUp = false;
                });
                // The topout animation doesn't require any interpolation, we're
                // already in the exact correct position.
                hero.animState.interpolationFrame = 0;
                return false;
            }
        } else {
            hero.state.isClimbing = false;
        }
    }
    return false;
}

// This is used to show a visual indicator of the target
// position to which the hero teleports after changing scene
/*
function debugZoneTargetPos(newScene, pos, color) {
    const axesHelper = new THREE.AxesHelper(5);
    const geometry = new THREE.SphereGeometry(0.05, 32, 32);
    const material = new THREE.MeshBasicMaterial({color: color});
    const sphere = new THREE.Mesh(geometry, material);
    const helper = new THREE.Object3D();
    helper.add(sphere);
    helper.add(axesHelper);
    helper.position.copy(pos);
    newScene.sceneNode.add(helper);
}
*/

// calculateTagetPosition returns the target position we should place Twinsen at
// in the new scene. This function attempts to work out the closest
// corresponding "exit" zone in the newScene and snap the location to that. If
// no such zone exists we fall back to the default location on the zone props.
function calculateTagetPosition(hero: Actor, zone: Zone, newScene: Scene) {
    // MAX_ZONE_DIST is the farthest away we would consider a TELEPORT
    // zone "the" matching zone we're looking for.
    const MAX_ZONE_DIST = 5 * BRICK_SIZE * WORLD_SCALE;
    // DEFAULT_OFFSET is the default offset we "push" Twinsen into the
    // scene to ensure he doesn't clip back into the zone we're close
    // to and immediately re-enter back into the previous scene.
    const DEFAULT_OFFSET = 0.5 * BRICK_SIZE * WORLD_SCALE;

    // Final calculated position.
    const position = new THREE.Vector3();

    // Where the zone props put us by default.
    const initialTargetPos = new THREE.Vector3(
        (0x8000 - zone.props.info2) * WORLD_SCALE,
        zone.props.info1 * WORLD_SCALE,
        zone.props.info0 * WORLD_SCALE
     );

    // Iterate over all of the zones in the new scene to find the
    // matching zone which we want to be placed at. We do this by
    // looking for the closest zone to Twinsen with type TELEPORT.
    // However, there are cases where such a zone doesn't exist and so
    // we require that the zone must be within 5 bricks of the
    // initialTargetPos. If there isn't one, we fall back and just using
    // the initialTargetPos.
    let closestZone = null;
    let smallestDistance = Number.MAX_SAFE_INTEGER;
    for (const newZone of newScene.zones) {
        if (newZone.zoneType !== 'TELEPORT') {
            continue;
        }

        const newZonePos = new THREE.Vector3(
            newZone.props.pos[0],
            newZone.props.pos[1],
            newZone.props.pos[2]
        );
        const distance = initialTargetPos.distanceTo(newZonePos);
        if (distance < MAX_ZONE_DIST && distance < smallestDistance) {
            smallestDistance = distance;
            closestZone = newZone;
        }
    }

    // delta represents Twinsens position along the zone. E.g. if
    // Twinsen enters a door on one side, we want the position we place
    // him in the new scene to also be on the same side and "line up".
    // delta is a ratio of the length e.g. Twinsen is 10% along the
    // length of the zone. We have to do this because the matching zone
    // in the new scene might be a different size to the current one.
    let delta = 0.0;
    // Work out which orientation the zone is, depending on this we can
    // determine which axis should be used to work out how far "along
    // the zone" Twinsen is.
    const lenX = zone.props.box.xMax - zone.props.box.xMin;
    const lenZ = zone.props.box.zMax - zone.props.box.zMin;
    if (lenX > lenZ) {
        delta = (hero.physics.position.x - zone.props.box.xMin) / lenX;
    } else {
        delta = (hero.physics.position.z - zone.props.box.zMin) / lenZ;
    }
    const lenY = zone.props.box.yMax - zone.props.box.yMin;
    const deltaY = (hero.physics.position.y - zone.props.box.yMin) / lenY;

    if (closestZone) {
        // console.log("Current scene ID: " + closestZone.props.snap +
        // " Target scene ID: " + zone.props.snap);

        // offset is how far we push Twinsen into the scene to ensure we
        // don't immediately re-enter back into the previous scene.
        let offset = DEFAULT_OFFSET;

        // If we have a specific override for this scene transition,
        // use that instead.
        const currentScene = SCENE_ID_TO_NAME[closestZone.props.snap];
        const targetScene = SCENE_ID_TO_NAME[zone.props.snap];
        if (ZONE_OFFSET_OVERRIDES[currentScene] &&
            ZONE_OFFSET_OVERRIDES[currentScene][targetScene]) {
            // tslint:disable-next-line:max-line-length
            offset = ZONE_OFFSET_OVERRIDES[currentScene][targetScene] * BRICK_SIZE * WORLD_SCALE;
        }

        // Again work out which orientation the zone is in the new scene
        // allowing us to know which axis to apply the delta to.
        const newBox = closestZone.props.box;
        const newLenX = newBox.xMax - newBox.xMin;
        const newLenZ = newBox.zMax - newBox.zMin;
        if (newLenX > newLenZ) {
            // Depending on which side of the zone we end up on we can determine
            // which direction we need to offset Twinsen.
            if (initialTargetPos.z <= newBox.zMin) {
                position.z = (-offset) + newBox.zMin;
            } else {
                position.z = offset + newBox.zMax;
            }
            position.x = delta * newLenX + newBox.xMin;
        } else {
            if (initialTargetPos.x <= closestZone.props.box.xMin) {
                position.x = (-offset) + newBox.xMin;
            } else {
                position.x = offset + newBox.xMax;
            }
            position.z = delta * newLenZ + newBox.zMin;
        }

        const newLenY = newBox.yMax - newBox.yMin;
        position.y = deltaY * newLenY + newBox.yMin;
    } else {
        position.x = initialTargetPos.x;
        position.y = initialTargetPos.y;
        position.z = initialTargetPos.z;
    }

    // debugZoneTargetPos(newScene, initialTargetPos, 0x0000ff);
    // debugZoneTargetPos(newScene, position, 0xffff00);
    return position;
}

/**
 * @return {boolean}
 */
function GOTO_SCENE(game: Game, scene: Scene, zone: Zone, hero: Actor, _time: Time) {
    hero.state.isClimbing = false;
    hero.state.isToppingOutUp = false;

    if (!(scene.sideScenes && scene.sideScenes.has(zone.props.snap))) {
        scene.goto(zone.props.snap).then((newScene) => {
            const newPosition = calculateTagetPosition(hero, zone, newScene);

            const newHero = newScene.actors[0];
            newHero.physics.position.x = newPosition.x;
            newHero.physics.position.y = newPosition.y;
            newHero.physics.position.z = newPosition.z;
            newHero.threeObject.position.copy(newHero.physics.position);

            const dAngle = -zone.props.info3 * (Math.PI / 2);
            if (game.controlsState.firstPerson) {
                const euler = new THREE.Euler();
                euler.setFromQuaternion(scene.camera.controlNode.quaternion, 'YXZ');
                euler.y += dAngle;
                newScene.camera.controlNode.quaternion.setFromEuler(euler);
            } else {
                const euler = new THREE.Euler();
                euler.setFromQuaternion(hero.physics.orientation, 'YXZ');
                euler.y += dAngle;
                newHero.physics.temp.angle = euler.y;
                newHero.physics.temp.destAngle = euler.y;
                newHero.physics.orientation.setFromEuler(euler);
                newHero.threeObject.quaternion.copy(newHero.physics.orientation);
            }

            // Preserve animation state and flags this ensures e.g. if we
            // jetpack across a scene change we continue without the animation
            // resetting.
            Object.keys(hero.state).forEach((k) => {
                newHero.state[k] = hero.state[k];
            });
            newHero.animState = hero.animState;
            newHero.props.animIndex = hero.props.animIndex;
            newHero.props.entityIndex = hero.props.entityIndex;
            newHero.props.bodyIndex = hero.props.bodyIndex;
            newHero.reloadModel(newScene);

            newScene.savedState = game.getState().save(newHero);
        });
        return true;
    }
    return false;
}

function TEXT(game: Game, scene: Scene, zone: Zone, hero: Actor, _time: Time) {
    if (game.controlsState.action === 1) {
        if (!scene.zoneState.skipListener) {
            const isLBA1 = getParams().game === 'lba1';
            scene.actors[0].props.dirMode = ActorDirMode.NO_MOVE;

            hero.props.prevEntityIndex = hero.props.entityIndex;
            hero.props.prevAnimIndex = hero.props.animIndex;
            hero.props.entityIndex = 0;
            hero.props.animIndex = isLBA1 ? AnimType.NONE : AnimType.TALK;

            const text = scene.props.texts[zone.props.snap];
            game.setUiState({
                text: {
                    type: text.type === 3 ? 'big' : 'small',
                    value: text.value,
                    color: getHtmlColor(scene.props.palette, (zone.props.info0 * 16) + 12)
                }
            });
            scene.zoneState.skipListener = () => {
                const skip = game.getUiState().skip;
                if (skip || scene.vr) {
                    scene.zoneState.ended = true;
                } else {
                    game.setUiState({
                        skip: true
                    });
                }
            };

            game.controlsState.skipListener = scene.zoneState.skipListener;

            hero.playVoice(text.index, scene.props.textBankId);
        }
    }
    if (scene.zoneState.ended) {
        scene.actors[0].props.dirMode = ActorDirMode.MANUAL;
        hero.props.entityIndex = hero.props.prevEntityIndex;
        hero.props.animIndex = hero.props.prevAnimIndex;
        hero.stopVoice();
        game.setUiState({ text: null, skip: false });
        game.controlsState.skipListener = null;
        delete scene.zoneState.skipListener;
        delete scene.zoneState.ended;
    }
    return false;
}

function BONUS(game: Game, scene: Scene, zone: Zone, hero: Actor, time: Time) {
    if (game.controlsState.action === 1) {
        game.controlsState.action = 0;

        hero.state.isSearching = true;
        hero.setAnimWithCallback(AnimType.ACTION, () => {
            hero.playSample(SampleType.TWINSEN_LANDING);
            hero.state.isSearching = false;

            if (zone.props.info2) {
                return false;
            }

            const bonusSprite = getBonus(zone.props.info0);
            let destAngle = angleTo(zone.physics.position, hero.physics.position);
            destAngle += angleToRad(getRandom(0, 300) - 150);

            const position = zone.physics.position.clone();
            const offset = new THREE.Vector3(0, 0.5, 0);
            offset.applyEuler(new THREE.Euler(0, destAngle, 0, 'XZY'));
            position.add(offset);
            Extra.load(
                game,
                scene,
                position,
                destAngle,
                bonusSprite,
                zone.props.info1,
                time,
            ).then(() => {
                // indicate the zone bonus has been given already
                zone.props.info2 = 1;
            });
        });
        return true;
    }
    return false;
}
