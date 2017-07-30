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
        loadPatches(sceneData, offset);

        loadTexts(sceneData, files.text);

        cachedSceneData[index] = sceneData;
        return sceneData;
    }
}

function loadAmbience(scene, offset) {
    const data = new DataView(scene.buffer, offset, offset + 49);
    let innerOffset = 0;

    scene.ambience = {
        lightingAlpha: data.getInt16(innerOffset, true),
        lightingBeta: data.getInt16(innerOffset + 2, true),
        samples: [],
        sampleMinDelay: data.getInt16(innerOffset + 44, true),
        sampleMinDelayRnd: data.getInt16(innerOffset + 46, true),
        sampleElapsedTime: 0,
        musicIndex: data.getInt8(innerOffset + 48, true),
    };

    innerOffset = 4;
    for (let i = 0; i < 4; ++i) {
        scene.ambience.samples.push({
            ambience:   data.getInt16(innerOffset    , true),
            repeat:     data.getInt16(innerOffset + 2, true),
            round:      data.getInt16(innerOffset + 4, true),
            frequency:  data.getInt16(innerOffset + 6, true),
            volume:     data.getInt16(innerOffset + 8, true),
        });
        innerOffset += 10;
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
            (0x8000 - data.getInt16(offset + 4, true) + 512) / 0x4000,
            data.getInt16(offset + 2, true) / 0x4000,
            data.getInt16(offset, true) / 0x4000
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

    hero.moveScriptSize = data.getInt16(offset, true);
    offset += 2;
    if (hero.moveScriptSize > 0) {
        hero.moveScript = new DataView(scene.buffer, offset, hero.moveScriptSize);
    }
    offset += hero.moveScriptSize;

    hero.lifeScriptSize = data.getInt16(offset, true);
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

    const numActors = data.getInt16(offset, true);
    offset += 2;

    for (let i = 1; i < numActors; ++i) {
        let actor = {
            sceneIndex: scene.index,
            index: i,
            dirMode: DirMode.NO_MOVE
        };

        const staticFlags = data.getUint32(offset, true);
        actor.flags = parseStaticFlags(staticFlags);
        offset += 4;
        
        actor.entityIndex = data.getInt16(offset, true);
        offset += 2;
        actor.bodyIndex = data.getInt8(offset++, true);
        actor.animIndex = data.getInt16(offset, true);
        offset += 2;
        actor.spriteIndex = data.getInt16(offset, true);
        offset += 2;
        
        actor.pos = [
            (0x8000 - data.getInt16(offset + 4, true) + 512) / 0x4000,
            data.getInt16(offset + 2, true) / 0x4000,
            data.getInt16(offset, true) / 0x4000
        ];
        offset += 6;

        actor.hitStrength = data.getInt8(offset++, true);
        actor.extraType = data.getInt16(offset, true);
        offset += 2;
        actor.angle = data.getInt16(offset, true);
        offset += 2;
        actor.speed = data.getInt16(offset, true);
        offset += 2;
        actor.controlMode = data.getInt8(offset++, true);

        actor.info0 = data.getInt16(offset, true);
        offset += 2;
        actor.info1 = data.getInt16(offset, true);
        offset += 2;
        actor.info2 = data.getInt16(offset, true);
        offset += 2;
        actor.info3 = data.getInt16(offset, true);
        offset += 2;

        actor.extraAmount = data.getInt16(offset, true);
        offset += 2;
        const textColor = data.getInt8(offset++, true);
        actor.textColor = getHtmlColor(scene.palette, textColor * 16 + 12);

        if (actor.flags & 0x00040000) { // Anim 3DS
            actor.spriteAnim3DNumber = data.getUint32(offset, true);
            offset += 4;
            actor.spriteSizeHit = data.getInt16(offset, true);
            actor.info3 = actor.spriteSizeHit;
            offset += 2;
        }
        actor.armour = data.getInt8(offset++, true);
        actor.life = data.getInt8(offset++, true);

        actor.moveScriptSize = data.getInt16(offset, true);
        offset += 2;
        if (actor.moveScriptSize > 0) {
            actor.moveScript = new DataView(scene.buffer, offset, actor.moveScriptSize);
        }
        offset += actor.moveScriptSize;

        actor.lifeScriptSize = data.getInt16(offset, true);
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

    const numZones = data.getInt16(offset, true);
    offset += 2;

    for (let i = 0; i < numZones; ++i) {
        let zone = {
            sceneIndex: scene.index,
            index: i,
            type: 0,
            box: {}
        };

        zone.box.bX = (0x8000 - data.getInt32(offset + 8, true) + 512) / 0x4000;
        zone.box.bY = data.getInt32(offset + 4, true) / 0x4000;
        zone.box.bZ = data.getInt32(offset, true) / 0x4000;
        zone.box.tX = (0x8000 - data.getInt32(offset + 20, true) + 512) / 0x4000;
        zone.box.tY = data.getInt32(offset + 16, true) / 0x4000;
        zone.box.tZ = data.getInt32(offset + 12, true) / 0x4000;
        offset += 24;

        zone.info0 = data.getInt32(offset, true);
        zone.info1 = data.getInt32(offset + 4, true);
        zone.info2 = data.getInt32(offset + 8, true);
        zone.info3 = data.getInt32(offset + 12, true);
        zone.info4 = data.getInt32(offset + 16, true);
        zone.info5 = data.getInt32(offset + 20, true);
        zone.info6 = data.getInt32(offset + 24, true);
        zone.info7 = data.getInt32(offset + 28, true);
        zone.type  = data.getInt16(offset + 32, true);
        zone.snap  = data.getInt16(offset + 34, true);
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

    const numPoints = data.getInt16(offset, true);
    offset += 2;

    for (let i = 0; i < numPoints; ++i) {
        let point = {
            sceneIndex: scene.index,
            index: i,
            pos: [
                (0x8000 - data.getInt32(offset + 8, true) + 512) / 0x4000,
                data.getInt32(offset + 4, true) / 0x4000,
                data.getInt32(offset, true) / 0x4000
            ]
        };
        offset += 12;
        scene.points.push(point);
    }

    return offset;
}

function loadPatches(scene, offset) {
    const data = new DataView(scene.buffer);
    scene.patches = [];

    const numData = data.getInt16(offset, true);
    offset += 2;

    for (let i = 0; i < numData; ++i) {
        let unk = {
            sceneIndex: scene.index,
            size: data.getInt16(offset, true),
            offset: data.getInt16(offset + 2, true)
        };
        offset += 4;
        scene.patches.push(unk);
    }

    return offset;
}

export function loadTexts(sceneData, textFile) {
    const mapData = new Uint16Array(textFile.getEntry(sceneData.textIndex));
    const data = new DataView(textFile.getEntry(sceneData.textIndex + 1));
    const texts = {};
    let start;
    let end;
    let idx = 0;
    do {
        start = data.getUint16(idx * 2, true);
        end = data.getUint16(idx * 2 + 2, true);
        const type = data.getUint8(start, true);
        let value = '';
        for (let i = start + 1; i < end - 1; ++i) {
            value += String.fromCharCode(Lba2Charmap[data.getUint8(i)]);
        }
        texts[mapData[idx]] = {type, index: idx, value};
        idx++;
    } while (end < data.byteLength);
    sceneData.texts = texts;
}

function parseStaticFlags(staticFlags) {
    return {
        hasCollisions: bits(staticFlags, 0, 1) === 1,
        hasCollisionBricks: bits(staticFlags, 1, 1) === 1,
        hasCollisionZone: bits(staticFlags, 2, 1) === 1,
        hasSpriteClipping: bits(staticFlags, 3, 1) === 1,
        hasCollisionLow: bits(staticFlags, 5, 1) === 1,
        hasCollisionFloor: bits(staticFlags, 7, 1) === 1,
        hasMiniZV: bits(staticFlags, 15, 1) === 1,
        hasInvalidPosition: bits(staticFlags, 16, 1) === 1,
        hasSpriteAnim3D: bits(staticFlags, 18, 1) === 1,
        hasZBuffer: bits(staticFlags, 20, 1) === 1,
        hasZBufferInWater: bits(staticFlags, 21, 1) === 1,

        canBePunched: bits(staticFlags, 4, 1) === 1,
        canDrown: bits(staticFlags, 6, 1) === 1,
        canFall: bits(staticFlags, 11, 1) === 1
        canCarrierActor: bits(staticFlags, 14, 1) === 1,

        isVisible: bits(staticFlags, 9, 1) === 0,
        isSprite: bits(staticFlags, 10, 1) === 1,
        isBackgrounded: bits(staticFlags, 13, 1) === 1,

        noShadow: bits(staticFlags, 12, 1) === 1,
        noElectricShock: bits(staticFlags, 17, 1) === 1,
        noPreClipping: bits(staticFlags, 19, 1) === 1,
    };
}

export function getHtmlColor(palette, index) {
    return '#' + new THREE.Color(
        palette[index * 3] / 255,
        palette[index * 3 + 1] / 255,
        palette[index * 3 + 2] / 255
    ).getHexString();
}
