import * as THREE from 'three';

const BASE_DISTANCE = -4.8;
const CAMERA_HERO_OFFSET = new THREE.Vector3(0, 2, BASE_DISTANCE);
const HERO_TARGET_POS = new THREE.Vector3(0, 2, 0);

export function getVR3DCamera() {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.name = 'VR3DCamera';
    const controlNode = new THREE.Object3D();
    controlNode.name = 'CameraControlNode';
    const orientation = new THREE.Object3D();
    orientation.name = 'AxisTransform';
    orientation.rotation.set(0, Math.PI, 0);
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
        || distanceToHero > 10
        || distanceToHero < 1.5) {
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
        scene.scenery.physics.processCameraCollisions(cameraPos, 2, 4);
        controlNode.position.copy(cameraPos);
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
