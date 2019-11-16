import * as THREE from 'three';
import { getHtmlColor } from '../../scene';
import { DirMode } from '../../game/actors';
import { AnimType } from '../data/animType';
import { angleTo, angleToRad, getRandom, WORLD_SCALE } from '../../utils/lba';
import { addExtra, ExtraFlag, randomBonus } from '../extras';

function NOP() { }

export const ZoneOpcode = [
    { opcode: 0, command: 'GOTO_SCENE', handler: GOTO_SCENE },
    { opcode: 1, command: 'CAMERA', handler: NOP },
    { opcode: 2, command: 'SCENERIC', handler: NOP },
    { opcode: 3, command: 'FRAGMENT', handler: NOP },
    { opcode: 4, command: 'BONUS', handler: BONUS },
    { opcode: 5, command: 'TEXT', handler: TEXT },
    { opcode: 6, command: 'LADDER', handler: NOP },
    { opcode: 7, command: 'CONVEYOR', handler: NOP },
    { opcode: 8, command: 'SPIKE', handler: NOP },
    { opcode: 9, command: 'RAIL', handler: NOP }
];

export function processZones(game, scene) {
    const hero = scene.actors[0];
    const pos = hero.physics.position.clone();
    pos.y += 0.005;
    for (let i = 0; i < scene.zones.length; i += 1) {
        const zone = scene.zones[i];
        if (zone.props.type === 2)
            continue;

        const box = zone.props.box;
        if (pos.x > box.xMin && pos.x < box.xMax &&
            pos.y > box.yMin && pos.y < box.yMax &&
            pos.z > box.zMin && pos.z < box.zMax) {
            const zoneType = ZoneOpcode[zone.props.type];
            if (zoneType !== null && zoneType.handler !== null) {
                if (zoneType.handler(game, scene, zone, hero))
                    break;
            }
        }
    }
}

// This is used to show a visual indicator of the target
// position to which the hero teleports after changing scene
/*
function debugZoneTargetPos(newScene, newHero) {
    const axesHelper = new THREE.AxesHelper(5);
    const geometry = new THREE.SphereGeometry(0.2, 32, 32);
    const material = new THREE.MeshBasicMaterial({color: 0xffff00});
    const sphere = new THREE.Mesh(geometry, material);
    const helper = new THREE.Object3D();
    helper.add(sphere);
    helper.add(axesHelper);
    helper.position.copy(newHero.physics.position);
    newScene.sceneNode.add(helper);
}
*/

/**
 * @return {boolean}
 */
function GOTO_SCENE(_game, scene, zone, hero) {
    if (!(scene.sideScenes && zone.props.snap in scene.sideScenes)) {
        const box = zone.props.box;
        scene.goto(zone.props.snap).then((newScene) => {
            const newHero = newScene.actors[0];
            const dx = hero.physics.position.x - box.xMax;
            const dy = hero.physics.position.y - box.yMin;
            const dz = hero.physics.position.z - box.zMin;
            newHero.physics.position.x = dx + (((0x8000 - zone.props.info2) + 512) * WORLD_SCALE);
            newHero.physics.position.y = dy + (zone.props.info1 * WORLD_SCALE);
            newHero.physics.position.z = dz + (zone.props.info0 * WORLD_SCALE);
            newHero.threeObject.position.copy(newHero.physics.position);

            // debugZoneTargetPos(newScene, newHero);

            const dAngle = -zone.props.info3 * (Math.PI / 2);
            const euler = new THREE.Euler();
            euler.setFromQuaternion(hero.physics.orientation, 'YXZ');
            euler.y += dAngle;
            newHero.physics.temp.angle = euler.y;
            newHero.physics.temp.destAngle = euler.y;
            newHero.physics.orientation.setFromEuler(euler);
            newHero.threeObject.quaternion.copy(newHero.physics.orientation);
        });
        return true;
    }
    return false;
}

function TEXT(game, scene, zone, hero) {
    const voiceSource = game.getAudioManager().getVoiceSource();
    if (game.controlsState.action === 1) {
        if (!scene.zoneState.skipListener) {
            scene.actors[0].props.dirMode = DirMode.NO_MOVE;

            hero.props.prevEntityIndex = hero.props.entityIndex;
            hero.props.prevAnimIndex = hero.props.animIndex;
            hero.props.entityIndex = 0;
            hero.props.animIndex = AnimType.TALK;
            scene.zoneState.currentChar = 0;

            const text = scene.data.texts[zone.props.snap];
            game.setUiState({
                text: {
                    type: text.type === 3 ? 'big' : 'small',
                    value: text.value,
                    color: getHtmlColor(scene.data.palette, (zone.props.info0 * 16) + 12)
                }
            });
            scene.zoneState.skipListener = () => {
                const skip = game.getUiState().skip;
                if (skip) {
                    scene.zoneState.ended = true;
                } else {
                    game.setUiState({
                        skip: true
                    });
                }
            };

            game.controlsState.skipListener = scene.zoneState.skipListener;

            voiceSource.load(text.index, scene.data.textBankId, () => {
                voiceSource.play();
            });
        }
    }
    if (scene.zoneState.ended) {
        scene.actors[0].props.dirMode = DirMode.MANUAL;
        hero.props.entityIndex = hero.props.prevEntityIndex;
        hero.props.animIndex = hero.props.prevAnimIndex;
        voiceSource.stop();
        game.setUiState({ text: null, skip: false });
        game.controlsState.skipListener = null;
        delete scene.zoneState.skipListener;
        delete scene.zoneState.ended;
        if (scene.zoneState.startTime) {
            delete scene.zoneState.startTime;
        }
    }
    return false;
}

function BONUS(game, scene, zone, hero) {
    if (game.controlsState.action === 1) {
        game.controlsState.action = 0;

        hero.props.prevEntityIndex = hero.props.entityIndex;
        hero.props.prevAnimIndex = hero.props.animIndex;
        hero.props.entityIndex = 0;
        hero.props.animIndex = AnimType.ACTION;

        if (zone.props.info2) {
            return false;
        }

        const bonusSprite = randomBonus(zone.props.info0);

        let destAngle = angleTo(zone.physics.position, hero.physics.position);
        destAngle += angleToRad(getRandom(0, 300) - 150);

        const position = zone.physics.position.clone();
        const offset = new THREE.Vector3(0.75, 0, 0);
        offset.applyEuler(new THREE.Euler(0, destAngle, 0, 'XZY'));
        position.add(offset);

        addExtra(
            scene,
            position,
            destAngle,
            bonusSprite,
            zone.props.info1,
            game.getTime(),
        ).then((extra) => {
            extra.flags |= ExtraFlag.TIME_IN;

            hero.props.entityIndex = hero.props.prevEntityIndex;
            hero.props.animIndex = hero.props.prevAnimIndex;
            zone.props.info2 = 1;
        });
        return true;
    }
    return false;
}
