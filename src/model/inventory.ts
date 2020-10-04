import * as THREE from 'three';

import { loadBody } from './body';
import {
    initSkeleton,
    createSkeleton,
    loadAnimState,
} from './animState';
import { loadMesh } from './geometries';
import { loadTextureRGBA } from '../texture';
import { createBoundingBox } from '../utils/rendering';
import { loadLUTTexture } from '../utils/lut';
import { loadResource, ResourceName } from '../resources';

export interface Model {
    state: any;
    files?: any;
    mesh: THREE.Object3D;
}

export async function loadInventoryModel(params: any,
                          invIdx: number,
                          envInfo: any,
                          ambience: any) {
    const [ress, pal, body, lutTexture] = await Promise.all([
        loadResource(ResourceName.RESS),
        loadResource(ResourceName.PALETTE),
        loadResource(ResourceName.OBJECTS),
        loadLUTTexture()
    ]);
    const files = { ress, pal, body };
    return loadInventoryModelData(
        params,
        files,
        invIdx,
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
function loadInventoryModelData(params: any,
                       files,
                       invIdx,
                       envInfo: any,
                       ambience: any,
                       lutTexture: THREE.Texture) {
    if (invIdx === -1)
        return null;

    const palette = files.pal.getBufferUint8();

    const model = {
        palette,
        lutTexture,
        files,
        bodies: [],
        texture: loadTextureRGBA(files.ress.getEntry(6), palette),
        mesh: null,
        boundingBox: null,
        boundingBoxDebugMesh: null,
        materials: []
    };

    const body = loadBody(model, model.bodies, invIdx, null);
    const animState = loadAnimState();

    const skeleton = createSkeleton(body);
    initSkeleton(animState, skeleton, 0);
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
