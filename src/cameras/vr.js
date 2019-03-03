import * as THREE from 'three';

const CAMERA_HERO_OFFSET = new THREE.Vector3(0, 2, -4.8);
const HERO_TARGET_POS = new THREE.Vector3(0, 2, 0);

export function getVRCamera() {
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
        threeCamera: camera,
        controlNode,
        resize: (width, height) => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        },
        init: (scene) => {
            processFollow3DMovement(controlNode, scene, true);
        },
        update: (scene) => {
            processFollow3DMovement(controlNode, scene);
        }
    };
}

const CAMERA_TARGET = new THREE.Object3D();

function processFollow3DMovement(controlNode, scene, forceUpdate = false) {
    const hero = scene.actors[0];
    const heroPos = HERO_TARGET_POS.clone();
    const cameraPos = CAMERA_HERO_OFFSET.clone();
    heroPos.applyMatrix4(hero.threeObject.matrixWorld);
    cameraPos.applyMatrix4(hero.threeObject.matrixWorld);
    scene.scenery.physics.processCameraCollisions(cameraPos, 2, 4);

    CAMERA_TARGET.position.copy(cameraPos);
    CAMERA_TARGET.lookAt(heroPos);
    const angleDiff = CAMERA_TARGET.quaternion.angleTo(controlNode.quaternion);
    const distance = CAMERA_TARGET.position.distanceTo(controlNode.position);
    const distanceFromHero = CAMERA_TARGET.position.distanceTo(heroPos);

    if (forceUpdate
        || Math.abs(angleDiff) > Math.PI / 4
        || distance > 5
        || distanceFromHero < 1) {
        controlNode.position.copy(cameraPos);
        controlNode.lookAt(heroPos);
    }
}
