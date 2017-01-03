// @flow

import async from 'async';

import THREE from 'three';
import {loadHqrAsync} from '../hqr';
import type {Entity} from './entity';
import {loadEntity, getBodyIndex, getAnimIndex} from './entity';
import {loadBody} from './body';
import {loadAnim} from './anim';
import type {Anim} from './anim';
import { loadAnimState, initSkeleton, createSkeleton, updateKeyframe} from './animState';
import {loadMesh} from './geometry';
import {loadTexture2} from '../texture';
import type {Time} from '../flowtypes';

export type Model = {
    state: any,
    anims: any,
    files: ?any,
    entities: Entity[],
    mesh: THREE.Object3D
}

export function loadModel(entityIdx: number, bodyIdx: number, animIdx: number, animState: any, callback: Function) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        body: loadHqrAsync('BODY.HQR'),
        anim: loadHqrAsync('ANIM.HQR'),
        anim3ds: loadHqrAsync('ANIM3DS.HQR')
    }, function(err, files) {
        callback(loadModelData(files, entityIdx, bodyIdx, animIdx, animState));
    });
}

/** Load Models Data
 *  Model will hold data specific to a single model instance.
 *  This will allow to mantain different states for body animations.
 *  This module will still kept data reloaded to avoid reload twice for now.
 */
function loadModelData(files, entityIdx, bodyIdx, animIdx, animState: any) {
    const palette = new Uint8Array(files.ress.getEntry(0));
    const entityInfo = files.ress.getEntry(44);
    const model = {
        palette: palette,
        files: files,
        bodies: [],
        anims: [],
        entities: loadEntity(entityInfo),
        texture: loadTexture2(files.ress.getEntry(6), palette),
        state: null,
        mesh: null
    };
    
    const entity = model.entities[entityIdx];
    const realBodyIdx = getBodyIndex(entity, bodyIdx);
    const realAnimIdx = getAnimIndex(entity, animIdx);

    const body = loadBody(model, model.bodies, realBodyIdx);
    const anim = loadAnim(model, model.anims, realAnimIdx);

    const skeleton = createSkeleton(body);
    initSkeleton(animState, skeleton, anim.loopFrame);
    model.mesh = loadMesh(body, model.texture, animState.matrixBones, model.palette);

    return model;
}

export function updateModel(model: Model, animState: any, entityIdx: number, bodyIdx: number, animIdx: number, time: Time) {
    const entity = model.entities[entityIdx];
    const realAnimIdx = getAnimIndex(entity, animIdx);
    const anim = loadAnim(model, model.anims, realAnimIdx);
    animState.loopFrame = anim.loopFrame;
    updateKeyframe(anim, animState, time);
}
/*
export function createAnimState(body, anim) {
    const skeleton = createSkeleton(body);
    return loadAnimState(skeleton, anim.loopFrame);
}
*/