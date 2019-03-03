import * as THREE from 'three';
import {IsometricCamera} from './utils/IsometricCamera';

const BASE_OFFSET = new THREE.Vector2(3500, 1001);

export function getIsometricCamera() {
    const size = getCameraSize(window.innerWidth, window.innerHeight);
    const camera = new IsometricCamera(size, BASE_OFFSET.clone());
    return {
        threeCamera: camera,
        resize: (width, height) => {
            camera.size.copy(getCameraSize(width, height));
            camera.updateProjectionMatrix();
        },
        init: (scene) => {
            centerCamera(camera, scene.actors[0]);
        },
        update: (scene, controlsState, time) => {
            if (controlsState.freeCamera) {
                processFreeIsoMovement(camera, controlsState, time);
            } else {
                centerCamera(camera, scene.actors[0]);
            }
        },
        centerOn: (object) => {
            centerCamera(camera, object);
        }
    };
}

function getCameraSize(width, height) {
    if (width > height) {
        return new THREE.Vector2(560, (560 / width) * height);
    }
    return new THREE.Vector2((560 / height) * width, 560);
}

function centerCamera(camera, object) {
    if (!object.threeObject)
        return;

    const pos = getObjectIsoPos(camera, object);
    const {width, height} = camera.size;
    const sz = new THREE.Vector2(width, height);
    pos.multiply(sz);
    camera.offset.add(pos);
    camera.updateProjectionMatrix();
}

function getObjectIsoPos(camera, object) {
    let objectHeight = 0;
    if (object.model) {
        const bb = object.model.boundingBox;
        objectHeight = bb.max.y - bb.min.y;
    }
    const pos = new THREE.Vector3(0, objectHeight * 0.5, 0);
    object.threeObject.updateMatrix();
    object.threeObject.updateMatrixWorld();
    pos.applyMatrix4(object.threeObject.matrixWorld);
    pos.project(camera);
    return new THREE.Vector2(pos.x, pos.y);
}

export function processFreeIsoMovement(camera, controlsState, time) {
    camera.offset.add(new THREE.Vector2(
        controlsState.cameraSpeed.x * time.delta * 500,
        -controlsState.cameraSpeed.z * time.delta * 500
    ));
    camera.updateProjectionMatrix();
}
