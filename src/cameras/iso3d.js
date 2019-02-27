import * as THREE from 'three';

export function getIso3DCamera() {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.001,
        100
    ); // 1m = 0.0625 units
    return {
        threeCamera: camera,
        resize: (width, height) => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        },
        init: (scene, controlsState) => {
            const { heroPos, cameraPos } = getTargetPos(scene);
            controlsState.cameraLerp.copy(cameraPos);
            controlsState.cameraLookAtLerp.copy(heroPos);
            camera.position.copy(controlsState.cameraLerp);
            camera.lookAt(controlsState.cameraLookAtLerp);
        },
        update: (scene, controlsState) => {
            const { heroPos, cameraPos } = getTargetPos(scene);

            controlsState.cameraLerp.lerpVectors(camera.position, cameraPos, 0.1);
            controlsState.cameraLookAtLerp.lerpVectors(
                controlsState.cameraLookAtLerp.clone(),
                heroPos,
                0.1);

            camera.position.copy(controlsState.cameraLerp);
            camera.lookAt(controlsState.cameraLookAtLerp);
        }
    };
}

function getTargetPos(scene) {
    const hero = scene.actors[0];
    const heroPos = new THREE.Vector3();
    heroPos.applyMatrix4(hero.threeObject.matrixWorld);
    const cameraPos = heroPos.clone();
    cameraPos.add(new THREE.Vector3(-0.25, 0.3, 0.25));
    return { heroPos, cameraPos };
}
