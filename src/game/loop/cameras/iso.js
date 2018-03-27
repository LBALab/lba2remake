import * as THREE from 'three';

export function processFollowIsoMovement(renderer, camera, scene) {
    centerIsoCamera(renderer, camera, scene);
}

export function centerIsoCamera(renderer, camera, scene) {
    const hero = scene.actors[0];
    if (!hero.model)
        return;
    const pos = getActorIsoPos(renderer, camera, hero);
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

function getActorIsoPos(renderer, camera, actor) {
    const bb = actor.model.boundingBox;
    const actorHeight = bb.max.y - bb.min.y;
    const pos = new THREE.Vector3(0, actorHeight * 0.5, 0);
    actor.threeObject.updateMatrixWorld();
    pos.applyMatrix4(actor.threeObject.matrixWorld);
    pos.project(camera);
    return new THREE.Vector2(pos.x, pos.y);
}
