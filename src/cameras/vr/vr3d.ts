import * as THREE from 'three';
import { WORLD_SIZE } from '../../utils/lba';
import sharedData from './sharedData';

const ADJ_WORLD_SIZE = Math.max(WORLD_SIZE, 2);

const BASE_DISTANCE = -0.2 * ADJ_WORLD_SIZE;
const BASE_HEIGHT = 0.08 * ADJ_WORLD_SIZE;
const CAMERA_HERO_OFFSET = new THREE.Vector3(0, BASE_HEIGHT, BASE_DISTANCE);
const HERO_TARGET_POS = new THREE.Vector3(0, BASE_HEIGHT, 0);

export function getVR3DCamera(renderer) {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        Math.min(0.004 * WORLD_SIZE, 0.1),
        42 * WORLD_SIZE
    );
    camera.name = 'VR3DCamera';
    const controlNode = new THREE.Object3D();
    controlNode.name = 'CameraControlNode';
    const orientation = new THREE.Object3D();
    orientation.name = 'AxisTransform';
    orientation.rotation.set(0, Math.PI, 0);
    orientation.updateMatrix();
    orientation.matrixAutoUpdate = false;
    controlNode.add(orientation);
    orientation.add(camera);
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        threeCamera: camera,
        controlNode,
        resize(width, height) {
            if (width !== this.width || height || this.height) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        },
        preRender() {
            if (sharedData.controllersHolder !== this) {
                for (let i = 0; i < 2; i += 1) {
                    const vrControllerGrip = renderer.threeRenderer.xr.getControllerGrip(i);
                    orientation.add(vrControllerGrip);
                    const vrController = renderer.threeRenderer.xr.getController(i);
                    orientation.add(vrController);
                }
                sharedData.controllersHolder = this;
            }
        },
        init: (scene) => {
            processFollow3DMovement(controlNode, scene, true);
        },
        update: (scene) => {
            processFollow3DMovement(controlNode, scene);
        },
        center: (scene) => {
            processFollow3DMovement(controlNode, scene, true);
        }
    };
}

const HERO_POS = new THREE.Vector3();
const FLAT_HERO_POS = new THREE.Vector3();
const FLAT_CAM = new THREE.Object3D();
const FLAT_CAM_POS = new THREE.Vector3();
const CAM_HERO_VEC = new THREE.Vector3();
const CAM_DIR_VEC = new THREE.Vector3();
const CAM_DIR_TARGET = new THREE.Object3D();
const HERO_VECTOR = new THREE.Vector3();

const MIN_DIST = 0.0625 * ADJ_WORLD_SIZE;
const MAX_DIST = 0.625 * ADJ_WORLD_SIZE;

function processFollow3DMovement(controlNode, scene, forceUpdate = false) {
    const hero = scene.actors[0];
    if (!hero.threeObject)
        return;

    HERO_POS.copy(HERO_TARGET_POS);
    HERO_POS.applyMatrix4(hero.threeObject.matrixWorld);

    FLAT_HERO_POS.copy(HERO_POS);
    FLAT_HERO_POS.y = 0;
    FLAT_CAM_POS.copy(controlNode.position);
    FLAT_CAM_POS.y = 0;
    const distanceToHero = FLAT_CAM_POS.distanceTo(FLAT_HERO_POS);

    FLAT_CAM.position.copy(FLAT_CAM_POS);
    FLAT_CAM.lookAt(FLAT_HERO_POS);

    CAM_HERO_VEC.copy(FLAT_HERO_POS);
    CAM_HERO_VEC.sub(FLAT_CAM_POS);

    CAM_DIR_VEC.set(0, 0, 1);
    CAM_DIR_VEC.applyQuaternion(controlNode.quaternion);

    const angle = angleBetween(CAM_DIR_VEC, CAM_HERO_VEC);
    const isMoreThan22DegsOff = Math.abs(angle) > (Math.PI / 8);

    if (forceUpdate
        || isMoreThan22DegsOff
        || distanceToHero > MAX_DIST
        || distanceToHero < MIN_DIST) {
        const cameraPos = CAMERA_HERO_OFFSET.clone();
        cameraPos.applyMatrix4(hero.threeObject.matrixWorld);

        CAM_DIR_TARGET.position.copy(cameraPos);
        CAM_DIR_TARGET.position.y = 0;
        CAM_DIR_TARGET.lookAt(FLAT_HERO_POS);

        HERO_VECTOR.set(0, 0, 1);
        HERO_VECTOR.applyQuaternion(hero.physics.orientation);

        const camHeroAngle = angleBetween(CAM_DIR_VEC, HERO_VECTOR);
        if (Math.abs(camHeroAngle) > Math.PI / 4 && !forceUpdate) {
            const targetAngle = (Math.PI / 8) * Math.sign(camHeroAngle);
            cameraPos.copy(HERO_TARGET_POS);
            const offset = new THREE.Vector3(0, 0, 1);
            const euler = new THREE.Euler();
            euler.setFromQuaternion(controlNode.quaternion, 'YXZ');
            euler.x = 0;
            euler.z = 0;
            euler.y += targetAngle;
            offset.applyEuler(euler);
            offset.multiplyScalar(BASE_DISTANCE);
            cameraPos.applyMatrix4(hero.threeObject.matrixWorld);
            cameraPos.add(offset);
        }
        const groundOffset = 0.01 * ADJ_WORLD_SIZE;
        const objOffset = 0.016 * ADJ_WORLD_SIZE;
        scene.scenery.physics.processCameraCollisions(cameraPos, groundOffset, objOffset);
        controlNode.position.copy(cameraPos);
        HERO_POS.y = cameraPos.y;
        controlNode.lookAt(HERO_POS);
    }
}

const QUAT = new THREE.Quaternion();
const EULER = new THREE.Euler();

function angleBetween(a, b) {
    const u1 = a.clone().normalize();
    const u2 = b.clone().normalize();
    QUAT.setFromUnitVectors(u1, u2);
    EULER.setFromQuaternion(QUAT, 'YXZ');
    return EULER.y;
}
