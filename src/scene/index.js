import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadHqrAsync} from '../hqr';

export default function(scene, index, callback) {
    async.auto({
        ress: loadHqrAsync('SCENE.HQR')
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
 
    

    return scene;
}
