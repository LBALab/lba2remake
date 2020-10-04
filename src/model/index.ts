import * as THREE from 'three';

import { loadEntity, getBodyIndex, getAnimIndex, Entity } from './entity';
import { loadBody } from './body';
import { loadAnim } from './anim';
import {
    initSkeleton,
    createSkeleton,
} from './animState';
import { loadMesh } from './geometries';
import { loadTextureRGBA } from '../texture';
import { createBoundingBox } from '../utils/rendering';
import { loadLUTTexture } from '../utils/lut';
import { loadResource, ResourceName } from '../resources';

export interface Model {
    state: any;
    anims: any;
    files?: any;
    entities: Entity[];
    mesh: THREE.Object3D;
}

export async function loadModel(params: any,
                          entityIdx: number,
                          bodyIdx: number,
                          animIdx: number,
                          animState: any,
                          envInfo: any,
                          ambience: any) {
    const [ress, pal, entities, body, anim, lutTexture] = await Promise.all([
        loadResource(ResourceName.RESS),
        loadResource(ResourceName.PALETTE),
        loadResource(ResourceName.ENTITIES),
        loadResource(ResourceName.BODY),
        loadResource(ResourceName.ANIM),
        loadLUTTexture()
    ]);
    const files = { ress, pal, entities, body, anim };
    return loadModelData(
        params,
        files,
        entityIdx,
        bodyIdx,
        animIdx,
        animState,
        envInfo,
        ambience,
        lutTexture
    );
}

/** Load Models Data
 *  Model will hold data specific to a single model instance.
 *  This will allow to mantain different states for body animations.
 *  This module will still kept data reloaded to avoid reload twice for now.
 */
function loadModelData(params: any,
                       files,
                       entityIdx,
                       bodyIdx,
                       animIdx,
                       animState: any,
                       envInfo: any,
                       ambience: any,
                       lutTexture: THREE.Texture) {
    if (entityIdx === -1 || bodyIdx === -1 || animIdx === -1)
        return null;

    const palette = files.pal.getBufferUint8();
    const entityInfo = files.entities.getBuffer();
    const entities = loadEntity(entityInfo);

    const model = {
        palette,
        lutTexture,
        files,
        bodies: [],
        anims: [],
        texture: loadTextureRGBA(files.ress.getEntry(6), palette),
        state: null,
        mesh: null,
        entities,
        boundingBox: null,
        boundingBoxDebugMesh: null,
        entity: entities[entityIdx],
        materials: []
    };

    const realBodyIdx = getBodyIndex(model.entity, bodyIdx);
    const realAnimIdx = getAnimIndex(model.entity, animIdx);

    const body = loadBody(model, model.bodies, realBodyIdx, model.entity.bodies[bodyIdx]);
    const anim = loadAnim(model, model.anims, realAnimIdx);

    const skeleton = createSkeleton(body);
    initSkeleton(animState, skeleton, anim.loopFrame);
    const { object, materials } = loadMesh(
        body,
        model.texture,
        animState.bones,
        animState.matrixRotation,
        model.palette,
        model.lutTexture,
        envInfo,
        ambience
    );
    model.mesh = object;
    model.materials = materials;

    if (model.mesh) {
        model.boundingBox = body.boundingBox;
        if (params.editor) {
            model.boundingBoxDebugMesh = createBoundingBox(
                body.boundingBox,
                new THREE.Vector3(1, 0, 0)
            );
            model.boundingBoxDebugMesh.name = 'BoundingBox';
            model.boundingBoxDebugMesh.visible = false;
            model.mesh.add(model.boundingBoxDebugMesh);
        }
    }

    return model;
}
