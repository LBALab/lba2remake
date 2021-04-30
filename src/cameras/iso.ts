import * as THREE from 'three';
import { WORLD_SIZE } from '../utils/lba';

const BASE_SIZE = WORLD_SIZE / 3;
const CAMERA_OFFSET = new THREE.Vector3(-1, 0.8, 1);
CAMERA_OFFSET.multiplyScalar(WORLD_SIZE);
const ANGLE_LEFT = new THREE.Euler(0, -Math.PI / 2, 0, 'YXZ');
const ANGLE_RIGHT = new THREE.Euler(0, Math.PI / 2, 0, 'YXZ');

export function getIsometricCamera() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scale = BASE_SIZE / (w < h ? w : h);
    const camera = new THREE.OrthographicCamera(
        -w * 0.5 * scale,
        w * 0.5 * scale,
        h * 0.5 * scale,
        -h * 0.5 * scale,
        0,
        42 * WORLD_SIZE
    );
    camera.name = 'IsoCamera';
    let actorIndex = 0;

    return {
        width: w,
        height: h,
        threeCamera: camera,
        actorIndex,
        resize(width, height) {
            if (width !== this.width || height || this.height) {
                const newScale = BASE_SIZE / (width < height ? width : height);
                camera.left = -width * 0.5 * newScale;
                camera.right = width * 0.5 * newScale;
                camera.top = height * 0.5 * newScale;
                camera.bottom = -height * 0.5 * newScale;
                camera.updateProjectionMatrix();
            }
        },
        init: (scene, controlsState) => {
            if (!scene.actors[actorIndex].threeObject)
                return;

            const { objectPos, cameraPos } = getTargetPos(scene.actors[actorIndex]);
            controlsState.cameraLerp.copy(cameraPos);
            controlsState.cameraLookAtLerp.copy(objectPos);
            camera.position.copy(controlsState.cameraLerp);
            camera.lookAt(controlsState.cameraLookAtLerp);
        },
        setActor: (newActor: number) => {
            actorIndex = newActor;
        },
        update: (scene, controlsState, time) => {
            if (controlsState.freeCamera) {
                processFreeIsoMovement(controlsState, camera, time);
            } else {
                if (!(scene.actors && scene.actors[actorIndex].threeObject) && !scene.target) {
                    return;
                }

                const target = scene.actors ? scene.actors[actorIndex] : scene.target;
                const { objectPos, cameraPos } = getTargetPos(target);

                controlsState.cameraLerp.lerpVectors(camera.position, cameraPos, 0.2);
                controlsState.cameraLookAtLerp.lerpVectors(
                    controlsState.cameraLookAtLerp.clone(),
                    objectPos,
                    0.2,
                );

                camera.position.copy(controlsState.cameraLerp);
                camera.lookAt(controlsState.cameraLookAtLerp);
            }
        },
        centerOn: (object) => {
            if (!object.threeObject)
                return;

            const { objectPos, cameraPos } = getTargetPos(object);

            camera.position.copy(cameraPos);
            camera.lookAt(objectPos);
        },
        rotateLeft() {
            CAMERA_OFFSET.applyEuler(ANGLE_LEFT);
        },
        rotateRight() {
            CAMERA_OFFSET.applyEuler(ANGLE_RIGHT);
        }
    };
}

function getTargetPos(object) {
    const objectPos = new THREE.Vector3();
    objectPos.applyMatrix4(object.threeObject.matrixWorld);
    const cameraPos = objectPos.clone();
    cameraPos.add(CAMERA_OFFSET);
    return { objectPos, cameraPos };
}

export function processFreeIsoMovement(controlsState, camera, time) {
    const speedX = new THREE.Vector3().set(
        3.6,
        0,
        3.6,
    );
    speedX.multiplyScalar(-controlsState.cameraSpeed.x);
    const speedZ = new THREE.Vector3().set(
        5,
        0,
        -5,
    );
    speedZ.multiplyScalar(controlsState.cameraSpeed.z);
    const speed = speedZ;
    speed.add(speedX);
    speed.multiplyScalar(time.delta);

    camera.position.add(speed);
}
