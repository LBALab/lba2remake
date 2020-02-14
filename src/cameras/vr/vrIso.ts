import * as THREE from 'three';
import { WORLD_SIZE } from '../../utils/lba';

const ADJ_WORLD_SIZE = Math.max(WORLD_SIZE, 2);

const CAMERA_HERO_OFFSET = new THREE.Vector3(-0.2, 0, 0.2);
CAMERA_HERO_OFFSET.multiplyScalar(ADJ_WORLD_SIZE);

export function getVRIsoCamera() {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        Math.min(0.004 * WORLD_SIZE, 0.1),
        42 * WORLD_SIZE
    );
    camera.name = 'VRIsoCamera';
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
        init: (scene) => {
            processFollowMovement(controlNode, scene, true);
        },
        update: (scene) => {
            processFollowMovement(controlNode, scene);
        },
        center: (scene) => {
            processFollowMovement(controlNode, scene, true);
        }
    };
}

const HERO_POS = new THREE.Vector3();
const DIST_THRESHOLD = 0.125 * ADJ_WORLD_SIZE;
const CAM_HEIGHT = 0.17 * ADJ_WORLD_SIZE;

function processFollowMovement(controlNode, scene, forceUpdate = false) {
    const hero = scene.actors[0];
    if (!hero.threeObject)
        return;

    HERO_POS.set(0, CAM_HEIGHT, 0);
    HERO_POS.applyMatrix4(hero.threeObject.matrixWorld);
    const cameraPos = HERO_POS.clone();
    cameraPos.add(CAMERA_HERO_OFFSET);

    const distance = cameraPos.distanceTo(controlNode.position);

    if (forceUpdate || distance > DIST_THRESHOLD) {
        controlNode.position.copy(cameraPos);
        controlNode.lookAt(HERO_POS);
    }
}
