import async from 'async';

import {loadHqrAsync} from '../hqr';
import {loadEntity, getBodyIndex, getAnimIndex} from './entity';
import {loadBody} from './body';
import {loadAnim} from './anim';
import {loadAnimState, updateKeyframe} from './animState';
import {loadMesh} from './geometry';
import {loadTexture2} from '../texture';

export type Model = {

}

export function loadModel(entityIdx, bodyIdx, animIdx, callback) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        body: loadHqrAsync('BODY.HQR'),
        anim: loadHqrAsync('ANIM.HQR'),
        anim3ds: loadHqrAsync('ANIM3DS.HQR')
    }, function(err, files) {
        callback(loadModelData(files, entityIdx, bodyIdx, animIdx));
    });
}

/** Load Models Data
 *  Model will hold data specific to a single model instance.
 *  This will allow to mantain different states for body animations.
 *  This module will still kept data reloaded to avoid reload twice for now.
 */
function loadModelData(files, entityIdx, bodyIdx, animIdx) {
    const palette = new Uint8Array(files.ress.getEntry(0));
    const entityInfo = files.ress.getEntry(44);
    const model = {
        palette: palette,
        files: files,
        bodies: [],
        anims: [],
        entities: loadEntity(entityInfo),
        texture: loadTexture2(files.ress.getEntry(6), palette)
    };
    
    const entity = model.entities[entityIdx];
    const realBodyIdx = getBodyIndex(entity, bodyIdx);
    const realAnimIdx = getAnimIndex(entity, animIdx);

    const body = loadBody(model, model.bodies, realBodyIdx);
    const anim = loadAnim(model, model.anims, realAnimIdx);
    
    model.state = loadAnimState(model, body, anim);
    model.mesh = loadMesh(model, body, model.state);

    return model;
}

export function updateModel(model, entityIdx, bodyIdx, animIdx, time) {
    const entity = model.entities[entityIdx];
    const realAnimIdx = getAnimIndex(entity, animIdx);
    const anim = loadAnim(model, model.anims, realAnimIdx);
    updateKeyframe(anim, model.state, time);
}
