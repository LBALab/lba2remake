import * as THREE from 'three';
import { processFree3DMovement } from './3d';

const CAMERA_HERO_OFFSET = new THREE.Vector3(-6, 7.2, 6);

const ANGLE_LEFT = new THREE.Euler(0, -Math.PI / 2, 0, 'YXZ');
const ANGLE_RIGHT = new THREE.Euler(0, Math.PI / 2, 0, 'YXZ');

export function getIso3DCamera() {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.name = 'Iso3DCamera';
    const controlNode = new THREE.Object3D();
    controlNode.name = 'CameraControlNode';
    const orientation = new THREE.Object3D();
    orientation.rotation.set(0, Math.PI, 0);
    orientation.name = 'AxisTransform';
    orientation.updateMatrix();
    orientation.matrixAutoUpdate = false;
    controlNode.add(orientation);
    orientation.add(camera);
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        controlNode,
        threeCamera: camera,
        resize(width, height) {
            if (width !== this.width || height || this.height) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        },
        init: (scene, controlsState) => {
            if (!(scene.actors && scene.actors[0].threeObject) && !scene.target) {
                return;
            }

            const target = scene.actors ? scene.actors[0] : scene.target;
            const { objectPos, cameraPos } = getTargetPos(target);
            controlsState.cameraLerp.copy(cameraPos);
            controlsState.cameraLookAtLerp.copy(objectPos);
            controlNode.position.copy(controlsState.cameraLerp);
            controlNode.lookAt(controlsState.cameraLookAtLerp);
        },
        update: (scene, controlsState, time) => {
            if (controlsState.freeCamera) {
                processFree3DMovement(controlsState, controlNode, scene, time);
            } else {
                if (!(scene.actors && scene.actors[0].threeObject) && !scene.target) {
                    return;
                }

                const target = scene.actors ? scene.actors[0] : scene.target;
                const { objectPos, cameraPos } = getTargetPos(target);

                controlsState.cameraLerp.lerpVectors(controlNode.position, cameraPos, 0.1);
                controlsState.cameraLookAtLerp.lerpVectors(
                    controlsState.cameraLookAtLerp.clone(),
                    objectPos,
                    0.1);

                controlNode.position.copy(controlsState.cameraLerp);
                controlNode.lookAt(controlsState.cameraLookAtLerp);
            }
        },
        centerOn: (object) => {
            if (!object.threeObject)
                return;

            const { objectPos, cameraPos } = getTargetPos(object);

            controlNode.position.copy(cameraPos);
            controlNode.lookAt(objectPos);
        },
        rotateLeft() {
            CAMERA_HERO_OFFSET.applyEuler(ANGLE_LEFT);
        },
        rotateRight() {
            CAMERA_HERO_OFFSET.applyEuler(ANGLE_RIGHT);
        }
    };
}

function getTargetPos(object) {
    const objectPos = new THREE.Vector3();
    objectPos.applyMatrix4(object.threeObject.matrixWorld);
    const cameraPos = objectPos.clone();
    cameraPos.add(CAMERA_HERO_OFFSET);
    return { objectPos, cameraPos };
}
