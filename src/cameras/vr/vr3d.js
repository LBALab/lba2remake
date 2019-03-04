import * as THREE from 'three';

const CAMERA_HERO_OFFSET = new THREE.Vector3(0, 2, -4.8);
const HERO_TARGET_POS = new THREE.Vector3(0, 2, 0);

export function getVR3DCamera() {
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

function processFollow3DMovement(controlNode, scene, forceUpdate = false) {
    const hero = scene.actors[0];
    const heroPos = HERO_TARGET_POS.clone();
    heroPos.applyMatrix4(hero.threeObject.matrixWorld);

    const flatHeroPos = new THREE.Vector3(heroPos.x, 0, heroPos.z);
    const flatCamPos = controlNode.position.clone();
    flatCamPos.y = 0;
    const distanceToHero = flatCamPos.distanceTo(flatHeroPos);

    if (forceUpdate
        || distanceToHero > 8
        || distanceToHero < 1.5) {
        const cameraPos = CAMERA_HERO_OFFSET.clone();
        cameraPos.applyMatrix4(hero.threeObject.matrixWorld);
        scene.scenery.physics.processCameraCollisions(cameraPos, 2, 4);
        controlNode.position.copy(cameraPos);
        controlNode.lookAt(heroPos);
    }
}
