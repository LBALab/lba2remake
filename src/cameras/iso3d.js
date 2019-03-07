import * as THREE from 'three';
import { processFree3DMovement } from './3d';

const CAMERA_HERO_OFFSET = new THREE.Vector3(-6, 7.2, 6);

export function getIso3DCamera() {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    const controlNode = new THREE.Object3D();
    const orientation = new THREE.Object3D();
    orientation.rotation.set(0, Math.PI, 0);
    controlNode.add(orientation);
    orientation.add(camera);
    return {
        controlNode,
        threeCamera: camera,
        resize: (width, height) => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        },
        init: (scene, controlsState) => {
            if (!scene.actors[0].threeObject)
                return;

            const { heroPos, cameraPos } = getTargetPos(scene);
            controlsState.cameraLerp.copy(cameraPos);
            controlsState.cameraLookAtLerp.copy(heroPos);
            controlNode.position.copy(controlsState.cameraLerp);
            controlNode.lookAt(controlsState.cameraLookAtLerp);
        },
        update: (scene, controlsState, time) => {
            if (controlsState.freeCamera) {
                processFree3DMovement(controlsState, controlNode, scene, time);
            } else {
                if (!scene.actors[0].threeObject)
                    return;

                const { heroPos, cameraPos } = getTargetPos(scene);

                controlsState.cameraLerp.lerpVectors(controlNode.position, cameraPos, 0.1);
                controlsState.cameraLookAtLerp.lerpVectors(
                    controlsState.cameraLookAtLerp.clone(),
                    heroPos,
                    0.1);

                controlNode.position.copy(controlsState.cameraLerp);
                controlNode.lookAt(controlsState.cameraLookAtLerp);
            }
        }
    };
}

function getTargetPos(scene) {
    const hero = scene.actors[0];
    const heroPos = new THREE.Vector3();
    heroPos.applyMatrix4(hero.threeObject.matrixWorld);
    const cameraPos = heroPos.clone();
    cameraPos.add(CAMERA_HERO_OFFSET);
    return { heroPos, cameraPos };
}
