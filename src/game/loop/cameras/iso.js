import * as THREE from 'three';

export function processFollowIsoMovement(renderer, camera, scene) {
    const hero = scene.actors[0];
    const pos = new THREE.Vector3(0, 0.04, 0);
    hero.threeObject.updateMatrixWorld();
    pos.applyMatrix4(hero.threeObject.matrixWorld);
    pos.project(camera);
    const widthHalf = 0.5 * renderer.canvas.width;
    const heightHalf = 0.5 * renderer.canvas.height;
    pos.x = -(pos.x * widthHalf) / renderer.pixelRatio();
    pos.y = -(pos.y * heightHalf) / renderer.pixelRatio();
    const maxDist = Math.min(widthHalf * 0.75 / renderer.pixelRatio(), heightHalf * 0.75 / renderer.pixelRatio());
    const centerDist = new THREE.Vector2(pos.x, pos.y);
    if (centerDist.length() > maxDist) {
        centerDist.multiplyScalar(renderer.pixelRatio());
        centerDist.multiplyScalar(3);
        camera.offset.sub(centerDist);
        camera.updateProjectionMatrix();
    }
}

export function centerIsoCamera(renderer, camera, scene) {
    console.log(camera.offset);
    camera.offset.x = 0;
    camera.offset.y = 0;
    camera.updateProjectionMatrix();

    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    processFollowIsoMovement(renderer, camera, scene);
    
    
    console.log(camera.offset);
}

export function processFreeIsoMovement(controlsState, camera, time) {
    camera.offset.add(new THREE.Vector2(
        controlsState.cameraSpeed.x * time.delta * 500,
        -controlsState.cameraSpeed.z * time.delta * 500
    ));
    camera.updateProjectionMatrix();
}
