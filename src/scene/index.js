import async from 'async';
import THREE from 'three';
import {DirMode} from '../game/actors';

import {loadHqrAsync} from '../hqr';
import Lba2Charmap from './data';
import {bits} from '../utils';

export function loadSceneData(index, callback) {
    async.auto({
        scene: loadHqrAsync('SCENE.HQR'),
        text: loadHqrAsync('TEXT.HQR'),
        ress: loadHqrAsync('RESS.HQR')
    }, function(err, files) {
        callback(loadSceneDataSync(files, index));
    });
}

const cachedSceneData = [];

function loadSceneDataSync(files, index) {
    if (cachedSceneData[index]) {
        return cachedSceneData[index];
    } else {
        const buffer = files.scene.getEntry(index + 1); // first entry is not a scene
        const data = new DataView(buffer);
        const textBankId = data.getInt8(0, true);

        const sceneData = {
            index: index,
            textBankId: textBankId,
            textIndex: textBankId * 2 + 6,
            gameOverScene: data.getInt8(1, true),
            unknown1: data.getUint16(2, true),
            unknown2: data.getUint16(4, true),
            isOutsideScene: data.getInt8(6, true) == 1,
            buffer: buffer,
            palette: new Uint8Array(files.ress.getEntry(0)),
            actors: []
        };

        let offset = 7;
        offset = loadAmbience(sceneData, offset);
        offset = loadHero(sceneData, offset);
        offset = loadActors(sceneData, offset);
        offset = loadZones(sceneData, offset);
        offset = loadPoints(sceneData, offset);
        loadUnknown(sceneData, offset);

        loadTexts(sceneData, files.text);

        cachedSceneData[index] = sceneData;
        return sceneData;
    }
}

function loadAmbience(scene, offset) {
    const data = new DataView(scene.buffer, offset, offset + 49);
    let innerOffset = 0;

    scene.ambience = {
        lightingAlpha: data.getUint16(innerOffset, true),
        lightingBeta: data.getUint16(innerOffset + 2, true), 
        samples: [],
        sampleMinDelay: data.getUint16(innerOffset + 44, true),
        sampleMinDelayRnd: data.getUint16(innerOffset + 46, true),
        sampleElapsedTime: 0,
        musicIndex: data.getInt8(innerOffset + 48, true),
    };

    const rawSamples = new Uint16Array(scene.buffer, innerOffset + 4, 4 * 5 * 2); // 4 entries, 3 types, 2 bytes each
    for (let i = 0; i < 4; ++i) {
        const index = i * 5;
        scene.ambience.samples.push({
            frequency:   rawSamples[index],
            repeat:     rawSamples[index + 1],
            round:     rawSamples[index + 2],
            unknown1:   rawSamples[index + 3],
            index:   rawSamples[index + 4]
        });
    }

    return offset + 49;
}


function loadHero(scene, offset) {
    const data = new DataView(scene.buffer);
    const hero = {
        sceneIndex: scene.index,
        entityIndex: 0,
        bodyIndex: 0,
        pos: [
            (0x8000 - data.getUint16(offset + 4, true) + 512) / 0x4000,
            data.getUint16(offset + 2, true) / 0x4000,
            data.getUint16(offset, true) / 0x4000
        ],
        index: 0,
        textColor: getHtmlColor(scene.palette, 12 * 16 + 12),
        angle: 0,
        speed: 5,
        dirMode: DirMode.MANUAL,
        flags: {
            hasCollisions: true,
            isVisible: true,
            isSprite: false
        }
    };
    offset += 6;

    hero.moveScriptSize = data.getUint16(offset, true);
    offset += 2;
    if (hero.moveScriptSize > 0) {
        hero.moveScript = new DataView(scene.buffer, offset, hero.moveScriptSize);
    }
    offset += hero.moveScriptSize;

    hero.lifeScriptSize = data.getUint16(offset, true);
    offset += 2;
    if (hero.lifeScriptSize > 0) {
        hero.lifeScript = new DataView(scene.buffer, offset, hero.lifeScriptSize);
    }
    offset += hero.lifeScriptSize;

    scene.actors.push(hero);

    return offset;
}

function loadActors(scene, offset) {
    const data = new DataView(scene.buffer);

    const numActors = data.getUint16(offset, true);
    offset += 2;

    for (let i = 1; i < numActors; ++i) {
        let actor = {
            sceneIndex: scene.index,
            index: i,
            dirMode: DirMode.NO_MOVE
        };

        const staticFlags = data.getUint16(offset, true);
        actor.flags = parseStaticFlags(staticFlags);
        offset += 2;
        actor.unknownFlags = data.getUint16(offset, true);
        offset += 2;
        
        actor.entityIndex = data.getUint16(offset, true);
        offset += 2;
        actor.bodyIndex = data.getUint8(offset++, true);
        offset++; // unknown byte
        actor.animIndex = data.getUint8(offset++, true);
        actor.spriteIndex = data.getUint16(offset, true);
        offset += 2;
        
        actor.pos = [
            (0x8000 - data.getUint16(offset + 4, true) + 512) / 0x4000,
            data.getUint16(offset + 2, true) / 0x4000,
            data.getUint16(offset, true) / 0x4000
        ];
        offset += 6;

        actor.hitStrength = data.getUint8(offset++, true);
        actor.extraType = data.getUint16(offset, true);
        offset += 2;
        actor.angle = data.getUint16(offset, true);
        offset += 2;
        actor.speed = data.getUint16(offset, true);
        offset += 2;
        actor.controlMode = data.getUint8(offset++, true);
        actor.info0 = data.getUint16(offset, true);
        offset += 2;
        actor.info1 = data.getUint16(offset, true);
        offset += 2;
        actor.info2 = data.getUint16(offset, true);
        offset += 2;
        actor.info3 = data.getUint16(offset, true);
        offset += 2;
        actor.extraAmount = data.getUint16(offset, true);
        offset += 2;
        const textColor = data.getUint8(offset++, true);
        actor.textColor = getHtmlColor(scene.palette, textColor * 16 + 12);
        if (actor.unknownFlags & 0x0004) { 
            actor.unknown0 = data.getUint16(offset, true);
            offset += 2;
            actor.unknown1 = data.getUint16(offset, true);
            offset += 2;
            actor.unknown2 = data.getUint16(offset, true);
            offset += 2;
        }
        actor.armour = data.getUint8(offset++, true);
        actor.life = data.getUint8(offset++, true);

        actor.moveScriptSize = data.getUint16(offset, true);
        offset += 2;
        if (actor.moveScriptSize > 0) {
            actor.moveScript = new DataView(scene.buffer, offset, actor.moveScriptSize);
        }
        offset += actor.moveScriptSize;

        actor.lifeScriptSize = data.getUint16(offset, true);
        offset += 2;
        if (actor.lifeScriptSize > 0) {
            actor.lifeScript = new DataView(scene.buffer, offset, actor.lifeScriptSize);
        }
        offset += actor.lifeScriptSize;

        scene.actors.push(actor);
    }

    return offset;
}

function loadZones(scene, offset) {
    const data = new DataView(scene.buffer);
    scene.zones = [];

    offset += 4; // skip unknown bytes

    const numZones = data.getUint16(offset, true);
    offset += 2;

    for (let i = 0; i < numZones; ++i) {
        let zone = {
            sceneIndex: scene.index,
            index: i,
            type: 0,
            box: {}
        };

        zone.box.bX = (0x8000 - data.getUint32(offset + 8, true) + 512) / 0x4000;
        zone.box.bY = data.getUint32(offset + 4, true) / 0x4000;
        zone.box.bZ = data.getUint32(offset, true) / 0x4000;
        zone.box.tX = (0x8000 - data.getUint32(offset + 20, true) + 512) / 0x4000;
        zone.box.tY = data.getUint32(offset + 16, true) / 0x4000;
        zone.box.tZ = data.getUint32(offset + 12, true) / 0x4000;
        offset += 24;

        zone.info0 = data.getUint32(offset, true);
        zone.info1 = data.getUint32(offset + 4, true);
        zone.info2 = data.getUint32(offset + 8, true);
        zone.info3 = data.getUint32(offset + 12, true);
        zone.info4 = data.getUint32(offset + 16, true);
        zone.info5 = data.getUint32(offset + 20, true);
        zone.info6 = data.getUint32(offset + 24, true);
        zone.info7 = data.getUint32(offset + 28, true);
        zone.type  = data.getUint16(offset + 32, true);
        zone.snap  = data.getUint16(offset + 34, true);
        offset += 36;

        // normalising position
        zone.pos = [
            zone.box.bX + (zone.box.tX - zone.box.bX)/2,
            zone.box.bY + (zone.box.tY - zone.box.bY)/2,
            zone.box.bZ + (zone.box.tZ - zone.box.bZ)/2
        ];

        scene.zones.push(zone);
    }

    return offset;
}

function loadPoints(scene, offset) {
    const data = new DataView(scene.buffer);
    scene.points = [];

    const numPoints = data.getUint16(offset, true);
    offset += 2;

    for (let i = 0; i < numPoints; ++i) {
        let point = {
            sceneIndex: scene.index,
            index: i,
            pos: [
                (0x8000 - data.getUint32(offset + 8, true) + 512) / 0x4000,
                data.getUint32(offset + 4, true) / 0x4000,
                data.getUint32(offset, true) / 0x4000
            ]
        };
        offset += 12;
        scene.points.push(point);
    }

    return offset;
}

function loadUnknown(scene, offset) {
    const data = new DataView(scene.buffer);
    scene.unknown = [];

    const numData = data.getUint16(offset, true);
    offset += 2;

    for (let i = 0; i < numData; ++i) {
        let unk = {
            sceneIndex: scene.index,
            field1: data.getUint16(offset, true),
            field2: data.getUint16(offset + 2, true)
        };
        offset += 4;
        scene.unknown.push(unk);
    }

    return offset;
}

function loadTexts(sceneData, textFile) {
    const mapData = new Uint16Array(textFile.getEntry(sceneData.textIndex));
    const data = new DataView(textFile.getEntry(sceneData.textIndex + 1));
    const texts = {};
    let start;
    let end;
    let idx = 0;
    do {
        start = data.getUint16(idx * 2, true);
        end = data.getUint16(idx * 2 + 2, true);
        const flags = data.getUint8(start, true);
        let value = '';
        for (let i = start + 1; i < end - 1; ++i) {
            value += String.fromCharCode(Lba2Charmap[data.getUint8(i)]);
        }
        value = value.replace(/@/g,'<br/>');
        texts[mapData[idx]] = {flags, index: idx, value};
        idx++;
    } while (end < data.byteLength);
    sceneData.texts = texts;
}

function parseStaticFlags(staticFlags) {
    return {
        hasCollisions: bits(staticFlags, 0, 1) == 1,
        isVisible: bits(staticFlags, 9, 1) == 0,
        isSprite: bits(staticFlags, 10, 1) == 1
    };
}

export function getHtmlColor(palette, index) {
    return '#' + new THREE.Color(
        palette[index * 3] / 255,
        palette[index * 3 + 1] / 255,
        palette[index * 3 + 2] / 255
    ).getHexString();
}
