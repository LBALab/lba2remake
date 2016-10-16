import async from 'async';

import {loadHqrAsync} from '../hqr';
import {loadEntity, getBodyIndex, getAnimIndex} from './entity';
import {loadBody} from './body';
import {loadAnim} from './anim';
import {loadAnimState, updateKeyframe} from './animState';
import {loadMesh} from './geometry';
import {loadTexture2} from '../texture';

export function loadModel(models, index, entityIdx, bodyIdx, animIdx, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        body: loadHqrAsync('BODY.HQR'),
        anim: loadHqrAsync('ANIM.HQR'),
        anim3ds: loadHqrAsync('ANIM3DS.HQR')
    }, function(err, files) {
        callback(loadModelData(files, models, index, entityIdx, bodyIdx, animIdx));
    });
}

/** Load Models Data
 *  Model will hold data specific to a single model instance.
 *  This will allow to mantain different states for body animations.
 *  This module will still kept data reloaded to avoid reload twice for now.
 */
function loadModelData(files, model, index, entityIdx, bodyIdx, animIdx) {
    if (!model) {
        model = {
            files: files,
            palette: new Uint8Array(files.ress.getEntry(0)),
            entity: files.ress.getEntry(44),
            bodies: [],
            anims: [],
            meshes: [],
            states: []
        };
        model.texture = loadTexture2(files.ress.getEntry(6), model.palette);
        model.entities = loadEntity(model.entity);
    }
    
    const entity = model.entities[entityIdx];
    const realBodyIdx = getBodyIndex(entity, bodyIdx);
    const realAnimIdx = getAnimIndex(entity, animIdx);

    const body = loadBody(model, model.bodies, realBodyIdx);
    const anim = loadAnim(model, model.anims, realAnimIdx);
    
    loadAnimState(model, body, anim, index);
    const state = model.states[index];
    
    if (!model.meshes[index]) {
        model.meshes[index] = loadMesh(model, body, state);
    }

    return model;
}

export function updateModel(model, index, entityIdx, bodyIdx, animIdx, time) {
    const entity = model.entities[entityIdx];
    const realAnimIdx = getAnimIndex(entity, animIdx);
    const anim = loadAnim(model, model.anims, realAnimIdx);
    updateKeyframe(anim, model.states[index], time);
}
