import async from 'async';
import _ from 'lodash';

import {loadHqrAsync} from '../hqr';

export default function(scene, index, callback) {
    async.auto({
        scenes: loadHqrAsync('SCENE.HQR')
    }, function(err, files) {
        callback(loadScene(files, scene, index));
    });
}

function loadScene(files, scene, index) {
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
        const buffer = files.scenes.getEntry(index);
        const data = new DataView(buffer);
        const textBankId = data.getInt8(0, true);

        const scene = {
            textBankId: textBankId,
            textIndex: textBankId * 2 + 6,
            gameOverScene: data.getInt8(1, true),

            buffer: buffer
        };

        let offset = 6;
        offset = loadAmbience(scene, offset);
        offset = loadHero(scene, offset);
        offset = loadActors(scene, offset);

        scenes[index] = scene;
        return scene;
    }
}

function loadAmbience(scene, offset) {
    const data = new DataView(scene.buffer, offset, offset + 33);

    scene.ambience = {
        lightingAlpha: data.getUint16(offset, true),
        lightingBeta: data.getUint16(offset + 2, true), 
        samples: [],
        sampleMinDelay: data.getUint16(offset + 28, true),
        sampleMinDelayRnd: data.getUint16(offset + 30, true),
        musicIndex: data.getInt8(offset + 32, true),
    };

    const rawSamples = new Uint16Array(scene.buffer, offset + 4, 4 * 3 * 2); // 4 entries, 3 types, 2 bytes each
    for (let i = 0; i < 4; ++i) {
        const index = i * 3;
        scene.ambience.samples.push({
            ambience: rawSamples[index],
            repeat:   rawSamples[index + 1],
            random:   rawSamples[index + 2]
        });
    }

    return offset + 33;
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
