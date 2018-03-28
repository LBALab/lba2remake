import * as THREE from 'three';

export function processFollowIsoMovement(renderer, camera, scene) {
    centerIsoCamera(renderer, camera, scene);
}

export function centerIsoCamera(renderer, camera, scene, object) {
    if (!object) {
        object = scene.actors[0];
    }

    const pos = getObjectIsoPos(renderer, camera, object);
    const {width, height} = renderer.canvas;
    const sz = new THREE.Vector2(width, height);
    pos.multiply(sz);
    camera.offset.add(pos);
    camera.updateProjectionMatrix();
}

export function processFreeIsoMovement(controlsState, camera, time) {
    camera.offset.add(new THREE.Vector2(
        controlsState.cameraSpeed.x * time.delta * 500,
        -controlsState.cameraSpeed.z * time.delta * 500
    ));
    camera.updateProjectionMatrix();
}

function getObjectIsoPos(renderer, camera, object) {
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
