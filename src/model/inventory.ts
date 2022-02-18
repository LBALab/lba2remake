import * as THREE from 'three';

import AnimState from './anim/AnimState';
import { loadMesh } from './geometries';
import { createBoundingBox } from '../utils/rendering';
import { getCommonResource, getPalette, getInventoryObjects, getModelsTexture } from '../resources';

export interface Model {
    state: any;
    files?: any;
    mesh: THREE.Object3D;
}

export async function loadInventoryModel(params: any, invIdx: number) {
    const [ress, pal, body, texture] = await Promise.all([
        getCommonResource(),
        getPalette(),
        getInventoryObjects(invIdx),
        getModelsTexture(),
    ]);
    const resources = { ress, pal, body, texture };
    return loadInventoryModelData(
        params,
        resources,
        invIdx,
    );
}

/** Load Models Data
 *  Model will hold data specific to a single model instance.
 *  This will allow to mantain different states for body animations.
 *  This module will still kept data reloaded to avoid reload twice for now.
 */
function loadInventoryModelData(params: any, resources, invIdx) {
    if (invIdx === -1)
        return null;

    const palette = resources.pal;
    const texture = resources.texture;
    const body = resources.body;

    const model = {
        palette,
        files: resources,
        bodies: [],
        texture,
        mesh: null,
        boundingBox: null,
        boundingBoxDebugMesh: null,
        materials: []
    };

    const animState = new AnimState();
    const bones = animState.attachBody(body);

    const { object, materials } = loadMesh(
        body,
        model.texture,
        bones,
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
