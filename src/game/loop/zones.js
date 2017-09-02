import {getHtmlColor} from '../../scene'

export const ZoneOpcode = [
    { opcode: 0, command: "CUBE", callback: CUBE },
    { opcode: 1, command: "CAMERA", callback: NOP },
    { opcode: 2, command: "SCENERIC", callback: NOP },
    { opcode: 3, command: "FRAGMENT", callback: NOP },
    { opcode: 4, command: "BONUS", callback: NOP },
    { opcode: 5, command: "TEXT", callback: TEXT },
    { opcode: 6, command: "LADDER", callback: NOP },
    { opcode: 7, command: "CONVEYOR", callback: NOP },
    { opcode: 8, command: "SPIKE", callback: NOP },
    { opcode: 9, command: "RAIL", callback: NOP }
];

export function processZones(game, scene) {
    const hero = scene.getActor(0);
    const pos = hero.physics.position.clone();
    pos.y += 0.005;
    for (let i = 0; i < scene.zones.length; ++i) {
        const zone = scene.zones[i];
        const box = zone.props.box;
        if (pos.x > Math.min(box.bX, box.tX) && pos.x < Math.max(box.bX, box.tX) &&
            pos.y > Math.min(box.bY, box.tY) && pos.y < Math.max(box.bY, box.tY) &&
            pos.z > Math.min(box.bZ, box.tZ) && pos.z < Math.max(box.bZ, box.tZ)) {
            const zoneType = ZoneOpcode[zone.props.type];
            if (zoneType != null && zoneType.callback != null) {
                zoneType.callback(game, scene, zone, hero);
                break;
            }
        }
    }
}

function CUBE(game, scene, zone, hero) {
    if(!(scene.sideScenes && zone.props.snap in scene.sideScenes)) {
        game.getSceneManager().goto(zone.props.snap, (newScene) => {
            const newHero = newScene.getActor(0);
            newHero.physics.position.x = (0x8000 - zone.props.info2 + 511) / 0x4000;
            newHero.physics.position.y = zone.props.info1 / 0x4000;
            newHero.physics.position.z = zone.props.info0 / 0x4000;
            newHero.physics.temp.angle = hero.physics.temp.angle;
            newHero.physics.orientation.copy(hero.physics.orientation);
            newHero.threeObject.position.copy(newHero.physics.position);
        });
    }
}

function TEXT(game, scene, zone, hero) {
    const voiceSource = game.getAudioManager().getVoiceSource();
    if (game.controlsState.action == 1) {
        if (!scene.zoneState.listener) {
            hero.props.prevEntityIndex = hero.props.entityIndex;
            hero.props.prevAnimIndex = hero.props.animIndex;
            hero.props.entityIndex = 0;
            hero.props.animIndex = 41;
            scene.zoneState.currentChar = 0;

            const textBox = document.getElementById('frameText');
            textBox.style.color = getHtmlColor(scene.data.palette, zone.props.info0 * 16 + 12);
            const text = scene.data.texts[zone.props.snap];
            if (text.type === 3) {
                textBox.className = "bigText";
            } else {
                textBox.className = "smallText";
            }
            textBox.innerHTML = '';
            let textInterval = setInterval(function () {
                textBox.style.display = 'block';
                const char = text.value.charAt(scene.zoneState.currentChar);
                if (char == '@') {
                    const br = document.createElement('br');
                    textBox.appendChild(br);
                } else {
                    textBox.innerHTML += char;
                }
                scene.zoneState.currentChar++;
                if (scene.zoneState.currentChar > text.value.length) {
                    clearInterval(textInterval);
                }
            }, 35);
            scene.zoneState.listener = function() {
                scene.zoneState.ended = true;
                clearInterval(textInterval);
            };

            window.addEventListener('keydown', scene.zoneState.listener);
            voiceSource.load(text.index, scene.data.textBankId, () => {
                voiceSource.play();
            });
        }
    }
    if (scene.zoneState.ended) {
        hero.props.entityIndex = hero.props.prevEntityIndex;
        hero.props.animIndex = hero.props.prevAnimIndex;
        voiceSource.stop();
        const textBox = document.getElementById('frameText');
        textBox.style.display = 'none';
        textBox.innerHTML = '';
        window.removeEventListener('keydown', scene.zoneState.listener);
        delete scene.zoneState.listener;
        delete scene.zoneState.ended;
    }
}

function NOP() {
}
