import {processFree3DMovement, processFollow3DMovement} from './3d';
import {processFreeIsoMovement, processFollowIsoMovement} from './iso';

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






