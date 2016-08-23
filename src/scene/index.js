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
        loadAmbience(scene, offset);

        scenes[index] = scene;
        return scene;
    }
}

function loadAmbience(scene, offset) {
    const data = new DataView(scene.buffer);

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
}
