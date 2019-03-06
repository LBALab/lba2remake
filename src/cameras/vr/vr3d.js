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

    const flatCam = new THREE.Object3D();
    flatCam.position.copy(flatCamPos);
    flatCam.lookAt(flatHeroPos);

    const camHeroVector = flatHeroPos.clone();
    camHeroVector.sub(flatCamPos);

    const camDirVector = new THREE.Vector3(0, 0, 1);
    camDirVector.applyQuaternion(controlNode.quaternion);

    const angle = angleBetween(camDirVector, camHeroVector);
    const isMoreThan22DegsOff = Math.abs(angle) > (Math.PI / 8);

    if (forceUpdate
        || isMoreThan22DegsOff
        || distanceToHero > 10
        || distanceToHero < 1.5) {
        const cameraPos = CAMERA_HERO_OFFSET.clone();
        cameraPos.applyMatrix4(hero.threeObject.matrixWorld);

        const camDirTarget = new THREE.Object3D();
        camDirTarget.position.copy(cameraPos);
        camDirTarget.position.y = 0;
        camDirTarget.lookAt(flatHeroPos);

        const newCamDirVector = new THREE.Vector3(0, 0, 1);
        newCamDirVector.applyQuaternion(camDirTarget.quaternion);

        const heroVector = new THREE.Vector3(0, 0, 1);
        heroVector.applyQuaternion(hero.physics.orientation);

        const camHeroAngle = angleBetween(camDirVector, heroVector);
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
        controlNode.lookAt(heroPos);
    }
}

function angleBetween(a, b) {
    const q = new THREE.Quaternion();
    const u1 = a.clone().normalize();
    const u2 = b.clone().normalize();
    q.setFromUnitVectors(u1, u2);
    const e = new THREE.Euler();
    e.setFromQuaternion(q, 'YXZ');
    return e.y;
}
