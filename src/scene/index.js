import async from 'async';
import _ from 'lodash';

import {loadHqrAsync} from '../hqr';

export function loadScene(scene, index, callback) {
    async.auto({
        scene: loadHqrAsync('SCENE.HQR')
    }, function(err, files) {
        callback(loadSceneFile(files, scene, index));
    });
}

function loadSceneFile(files, scene, index) {
    if (!scene.data) {
        scene.data = {
            files: files,
            scenes: []
        };
    }
 
    loadSceneData(scene.data.files, scene.data.scenes, index);

    return scene;
}

function loadSceneData(files, scenes, index) {
    if (scenes[index]) {
        return scenes[index];
    } else {
        const buffer = files.scene.getEntry(index + 1); // first entry is not a scene
        const data = new DataView(buffer);
        const textBankId = data.getInt8(0, true);

        const scene = {
            textBankId: textBankId,
            textIndex: textBankId * 2 + 6,
            gameOverScene: data.getInt8(1, true),
            unknown1: data.getUint16(2, true),
            unknown2: data.getUint16(4, true),
            isOutsideScene: data.getInt8(6, true) == 1,

            buffer: buffer
        };

        let offset = 7;
        offset = loadAmbience(scene, offset);
        offset = loadHero(scene, offset);
        offset = loadActors(scene, offset);
        offset = loadZones(scene, offset);
        offset = loadPoints(scene, offset);
        offset = loadUnknown(scene, offset);

        scenes[index] = scene;
        return scene;
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
        musicIndex: data.getInt8(innerOffset + 48, true),
    };

    const rawSamples = new Uint16Array(scene.buffer, innerOffset + 4, 4 * 5 * 2); // 4 entries, 3 types, 2 bytes each
    for (let i = 0; i < 4; ++i) {
        const index = i * 5;
        scene.ambience.samples.push({
            ambience:   rawSamples[index],
            repeat:     rawSamples[index + 1],
            random:     rawSamples[index + 2],
            unknown1:   rawSamples[index + 3],
            unknown2:   rawSamples[index + 4]
        });
    }

    return offset + 49;
}


function loadHero(scene, offset) {
    const data = new DataView(scene.buffer);
    scene.hero = {
        pos: [
            data.getUint16(offset, true),
            data.getUint16(offset + 2, true),
            data.getUint16(offset + 4, true)
        ]
    }
    offset += 6;

    scene.hero.moveScriptSize = data.getUint16(offset, true);
    offset += 2;
    scene.hero.moveScript = new DataView(scene.buffer, offset, scene.hero.moveScriptSize);
    offset += scene.hero.moveScriptSize;

    scene.hero.lifeScriptSize = data.getUint16(offset, true);
    offset += 2;
    scene.hero.lifeScript = new DataView(scene.buffer, offset, scene.hero.lifeScriptSize);
    offset += scene.hero.lifeScriptSize;

    return offset;
}

function loadActors(scene, offset) {
    const data = new DataView(scene.buffer);
    scene.actors = [];

    const numActors = data.getUint16(offset, true);
    offset += 2;

    for (let i = 0; i < numActors; ++i) {
        let actor = {};

        actor.staticFlags = data.getUint16(offset, true);
        offset += 2;
        actor.unknownFlags = data.getUint16(offset, true);
        offset += 2;
        
        actor.entityIndex = data.getUint16(offset, true);
        offset += 2;
        actor.bodyIndex = data.getUint8(offset, true);
        ++offset;
        ++offset; // unknown byte
        actor.animIndex = data.getUint8(offset, true);
        ++offset;
        actor.spriteIndex = data.getUint16(offset, true);
        offset += 2;
        
        actor.pos = [
            data.getUint16(offset, true),
            data.getUint16(offset + 2, true),
            data.getUint16(offset + 4, true)
        ];
        offset += 6;

        actor.hitStrength = data.getUint8(offset++, true);
        actor.extraType = data.getUint16(offset, true);
        offset += 2;
        actor.angle = data.getUint16(offset, true);
        offset += 2;
        actor.speed = data.getUint16(offset, true);
        offset += 2;
        actor.controlMode = data.getUint16(offset, true);
        offset += 2;
        actor.info0 = data.getUint16(offset, true);
        offset += 2;
        actor.info1 = data.getUint16(offset, true);
        offset += 2;
        actor.info2 = data.getUint16(offset, true);
        offset += 2;
        actor.info3 = data.getUint16(offset, true);
        offset += 2;
        actor.extraAmout = data.getUint8(offset++, true);
        actor.textColor = data.getUint8(offset++, true);
        actor.armour = data.getUint8(offset++, true);
        actor.life = data.getUint8(offset++, true);

        if (actor.unknownFlags & 0x0004) {
            offset += 6; // skip unknown
        }

        actor.moveScriptSize = data.getUint16(offset, true);
        offset += 2;
        actor.moveScript = new DataView(scene.buffer, offset, actor.moveScriptSize);
        offset += actor.moveScriptSize;

        actor.lifeScriptSize = data.getUint16(offset, true);
        offset += 2;
        actor.lifeScript = new DataView(scene.buffer, offset, actor.lifeScriptSize);
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
            type: 0,
            box: null
        };

        zone.box.bX = data.getUint32(offset);
        zone.box.bY = data.getUint32(offset + 4);
        zone.box.bZ = data.getUint32(offset + 8);
        zone.box.tX = data.getUint32(offset + 12);
        zone.box.tY = data.getUint32(offset + 16);
        zone.box.tZ = data.getUint32(offset + 20);        
        offset += 24;

        zone.info0 = data.getUint32(offset);
        zone.info1 = data.getUint32(offset + 4);
        zone.info2 = data.getUint32(offset + 8);
        zone.info3 = data.getUint32(offset + 12);
        zone.info4 = data.getUint32(offset + 16);
        zone.info5 = data.getUint32(offset + 20);
        zone.info6 = data.getUint32(offset + 24);
        zone.info7 = data.getUint32(offset + 28);
        zone.type  = data.getUint16(offset + 32);
        zone.snap  = data.getUint16(offset + 34);
        offset += 36;

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
            pos: [
                data.getUint32(offset, true),
                data.getUint32(offset + 4, true),
                data.getUint32(offset + 8, true)
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
            field1: data.getUint16(offset, true),
            field2: data.getUint16(offset + 2, true)
        };
        offset += 4;
        scene.unknown.push(unk);
    }

    return offset;
}
