import {getHtmlColor} from '../../scene';
import {DirMode} from '../../game/actors.ts';

export const ZoneOpcode = [
    { opcode: 0, command: 'CUBE', handler: CUBE },
    { opcode: 1, command: 'CAMERA', handler: NOP },
    { opcode: 2, command: 'SCENERIC', handler: NOP },
    { opcode: 3, command: 'FRAGMENT', handler: NOP },
    { opcode: 4, command: 'BONUS', handler: NOP },
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

/**
 * @return {boolean}
 */
function CUBE(game, scene, zone, hero) {
    if (!(scene.sideScenes && zone.props.snap in scene.sideScenes)) {
        scene.goto(zone.props.snap).then((newScene) => {
            const newHero = newScene.actors[0];
            newHero.physics.position.x = ((0x8000 - zone.props.info2) + 511) / 0x4000;
            newHero.physics.position.y = zone.props.info1 / 0x4000;
            newHero.physics.position.z = zone.props.info0 / 0x4000;
            newHero.physics.temp.angle = hero.physics.temp.angle;
            newHero.physics.orientation.copy(hero.physics.orientation);
            newHero.threeObject.quaternion.copy(newHero.physics.orientation);
            newHero.threeObject.position.copy(newHero.physics.position);
        });
        return true;
    }
    return false;
}

function TEXT(game, scene, zone, hero) {
    const voiceSource = game.getAudioManager().getVoiceSource();
    if (game.controlsState.action === 1) {
        if (!scene.zoneState.listener) {
            scene.actors[0].props.dirMode = DirMode.NO_MOVE;

            hero.props.prevEntityIndex = hero.props.entityIndex;
            hero.props.prevAnimIndex = hero.props.animIndex;
            hero.props.entityIndex = 0;
            hero.props.animIndex = 28; // talking / reading
            scene.zoneState.currentChar = 0;

            const text = scene.data.texts[zone.props.snap];
            game.setUiState({
                text: {
                    type: text.type === 3 ? 'big' : 'small',
                    value: text.value,
                    color: getHtmlColor(scene.data.palette, (zone.props.info0 * 16) + 12)
                }
            });
            scene.zoneState.listener = (event) => {
                const key = event.code || event.which || event.keyCode;
                if (key === 'Enter' || key === 13) {
                    const skip = game.getUiState().skip;
                    if (skip) {
                        scene.zoneState.ended = true;
                    } else {
                        game.setUiState({
                            skip: true
                        });
                    }
                }
            };
            scene.zoneState.listenerStart = function listenerStart() {
                scene.zoneState.startTime = Date.now();
            };
            scene.zoneState.listenerEnd = function listenerEnd() {
                const endTime = Date.now();
                const elapsed = endTime - scene.zoneState.startTime;
                if (elapsed < 300) {
                    const skip = game.getUiState().skip;
                    if (skip) {
                        scene.zoneState.ended = true;
                    } else {
                        game.setUiState({
                            skip: true
                        });
                    }
                }
            };

            window.addEventListener('keydown', scene.zoneState.listener);
            window.addEventListener('touchstart', scene.zoneState.listenerStart);
            window.addEventListener('touchend', scene.zoneState.listenerEnd);

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
        window.removeEventListener('keydown', scene.zoneState.listener);
        window.removeEventListener('touchstart', scene.zoneState.listenerStart);
        window.removeEventListener('touchend', scene.zoneState.listenerEnd);
        delete scene.zoneState.listener;
        delete scene.zoneState.listenerStart;
        delete scene.zoneState.listenerEnd;
        delete scene.zoneState.ended;
        if (scene.zoneState.startTime) {
            delete scene.zoneState.startTime;
        }
    }
}

function NOP() {
}
