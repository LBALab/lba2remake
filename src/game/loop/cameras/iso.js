import THREE from 'three';

export function processFollowIsoMovement(renderer, camera, scene, time) {
    const hero = scene.getActor(0);
    const pos = new THREE.Vector3(0, 0.04, 0);
    hero.threeObject.updateMatrixWorld();
    pos.applyMatrix4(hero.threeObject.matrixWorld);
    pos.project(camera);
    const widthHalf = 0.5 * renderer.domElement.width;
    const heightHalf = 0.5 * renderer.domElement.height;
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

export function processFreeIsoMovement(controlsState, camera, time) {
    camera.offset.add(new THREE.Vector2(
        controlsState.cameraSpeed.x * time.delta * 500,
        -controlsState.cameraSpeed.z * time.delta * 500
    ));
    camera.updateProjectionMatrix();
}
