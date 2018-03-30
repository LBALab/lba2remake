import {
    initFollow3DMovement,
    processFree3DMovement,
    processFollow3DMovement
} from './3d';

import {
    processFreeIsoMovement,
    processFollowIsoMovement,
    centerIsoCamera
} from './iso';

export function initCameraMovement(controlsState, renderer, scene) {
    if (scene.isIsland && !controlsState.freeCamera) {
        initFollow3DMovement(controlsState, renderer.cameras.camera3D, scene);
    }

    if (!scene.isIsland && controlsState.freeCamera) {
        centerIsoCamera(renderer, renderer.cameras.isoCamera, scene);
    }
}

export function processCameraMovement(controlsState, renderer, scene, time) {
    if (scene.isIsland) {
        if (controlsState.freeCamera) {
            processFree3DMovement(controlsState, renderer.cameras.camera3D, scene, time);
        } else {
            processFollow3DMovement(controlsState, renderer.cameras.camera3D, scene, time);
        }
    } else {
        if (controlsState.freeCamera) {
            processFreeIsoMovement(controlsState, renderer.cameras.isoCamera, time);
        } else {
            processFollowIsoMovement(renderer, renderer.cameras.isoCamera, scene, time);
        }
    }
}
