// @flow

import async from 'async';

import THREE from 'three';
import {loadHqrAsync} from '../hqr';
import type {Entity} from './entity';
import {loadEntity, getBodyIndex, getAnimIndex} from './entity';
import {loadBody} from './body';
import {loadAnim} from './anim';
import { initSkeleton, createSkeleton, updateKeyframe} from './animState';
import {loadMesh} from './geometries';
import {loadTexture2} from '../texture';
import {createBoundingBox} from '../utils/rendering';
import type {Time} from '../flowtypes';

export type Model = {
    state: any,
    anims: any,
    files: ?any,
    entities: Entity[],
    mesh: THREE.Object3D
}

export function loadModel(entityIdx: number, bodyIdx: number, animIdx: number, animState: any, envInfo: any, ambience: any, callback: Function) {
    async.auto({
        ress: loadHqrAsync('RESS.HQR'),
        body: loadHqrAsync('BODY.HQR'),
        anim: loadHqrAsync('ANIM.HQR'),
        anim3ds: loadHqrAsync('ANIM3DS.HQR')
    }, function(err, files) {
        callback(loadModelData(files, entityIdx, bodyIdx, animIdx, animState, envInfo, ambience));
    });
}

/** Load Models Data
 *  Model will hold data specific to a single model instance.
 *  This will allow to mantain different states for body animations.
 *  This module will still kept data reloaded to avoid reload twice for now.
 */
function loadModelData(files, entityIdx, bodyIdx, animIdx, animState: any, envInfo: any, ambience: any) {
    const palette = new Uint8Array(files.ress.getEntry(0));
    const entityInfo = files.ress.getEntry(44);
    const entities = loadEntity(entityInfo);

    const model = {
        palette: palette,
        files: files,
        bodies: [],
        anims: [],
        texture: loadTexture2(files.ress.getEntry(6), palette),
        state: null,
        mesh: null,
        entities: entities
    };

    const entity = entities[entityIdx];
    const bodyProps = entity.bodies[bodyIdx];

    const realBodyIdx = getBodyIndex(entity, bodyIdx);
    const realAnimIdx = getAnimIndex(entity, animIdx);

    const body = loadBody(model, model.bodies, realBodyIdx);
    const anim = loadAnim(model, model.anims, realAnimIdx);

    const skeleton = createSkeleton(body);
    initSkeleton(animState, skeleton, anim.loopFrame);
    model.mesh = loadMesh(body, model.texture, animState.matrixBones, animState.matrixRotation, model.palette, envInfo, ambience);

    if (model.mesh && bodyProps && bodyProps.hasCollisionBox) {
        const {tX, tY, tZ, bX, bY, bZ} = bodyProps.box;
        const box = new THREE.Box3(
            new THREE.Vector3(
                Math.min(tX, bX) / 0x4000,
                Math.min(tY, bY) / 0x4000,
                Math.min(tZ, bZ) / 0x4000
            )
            ,
            new THREE.Vector3(
                Math.max(tX, bX) / 0x4000,
                Math.max(tY, bY) / 0x4000,
                Math.max(tZ, bZ) / 0x4000
            )
        );
        model.mesh.add(createBoundingBox(box, new THREE.Vector3(0, 1, 0)));
    }

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