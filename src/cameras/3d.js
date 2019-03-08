import * as THREE from 'three';

const CAMERA_HERO_OFFSET = new THREE.Vector3(0, 3.6, -4.8);
const HERO_TARGET_POS = new THREE.Vector3(0, 1.92, 0);

export function get3DCamera() {
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
        init: (scene, controlsState) => {
            if (!controlsState.freeCamera) {
                const hero = scene.actors[0];
                if (!hero.threeObject)
                    return;
                const heroPos = HERO_TARGET_POS.clone();
                heroPos.applyMatrix4(hero.threeObject.matrixWorld);

                const cameraPos = CAMERA_HERO_OFFSET.clone();
                cameraPos.applyMatrix4(hero.threeObject.matrixWorld);
                controlsState.cameraLerp.copy(cameraPos);
                controlsState.cameraLookAtLerp.copy(heroPos);
                controlNode.position.copy(cameraPos);
                controlNode.lookAt(controlsState.cameraLookAtLerp);
            }
        },
        update: (scene, controlsState, time) => {
            if (controlsState.freeCamera) {
                processFree3DMovement(controlsState, controlNode, scene, time);
            } else {
                processFollow3DMovement(controlsState, controlNode, scene, time);
            }
        }
    };
}

function processFollow3DMovement(controlsState, controlNode, scene, time) {
    const hero = scene.actors[0];
    if (!hero.threeObject)
        return;

    const heroPos = HERO_TARGET_POS.clone();
    const cameraPos = CAMERA_HERO_OFFSET.clone();
    heroPos.applyMatrix4(hero.threeObject.matrixWorld);
    cameraPos.applyMatrix4(hero.threeObject.matrixWorld);
    scene.scenery.physics.processCameraCollisions(cameraPos);

    controlsState.cameraLerp.lerpVectors(controlNode.position, cameraPos, time.delta * 2);
    controlsState.cameraLookAtLerp.lerpVectors(
        controlsState.cameraLookAtLerp.clone(),
        heroPos,
        time.delta * 6);
    controlNode.position.set(
        controlsState.cameraLerp.x,
        controlsState.cameraLerp.y,
        controlsState.cameraLerp.z);
    controlNode.lookAt(controlsState.cameraLookAtLerp);
}

export function processFree3DMovement(controlsState, controlNode, scene, time) {
    let speedFactor = 0;
    let height = 0;
    if (scene.isIsland) {
        const groundInfo = scene.scenery.physics.getGroundInfo(controlNode.position);
        height = groundInfo.height;
        speedFactor = Math.max(
            0.0,
            Math.min(1.0, (controlNode.position.y - groundInfo.height) * 0.7)
        );
    }

    const euler = new THREE.Euler();
    euler.setFromQuaternion(controlsState.cameraHeadOrientation, 'YXZ');
    const speed = new THREE.Vector3().set(
        controlsState.cameraSpeed.x * 7.2,
        -(controlsState.cameraSpeed.z * 12) * euler.x,
        controlsState.cameraSpeed.z * 7.2
    );

    speed.multiplyScalar((speedFactor * speedFactor * 0.125) + 1);
    speed.applyQuaternion(controlsState.cameraOrientation);
    speed.applyQuaternion(onlyY(controlsState.cameraHeadOrientation));
    speed.multiplyScalar(time.delta);

    controlNode.position.add(speed);
    controlNode.position.y = Math.max(height + 1.5, controlNode.position.y);
    controlNode.quaternion.copy(controlsState.cameraOrientation);
    controlNode.quaternion.multiply(controlsState.cameraHeadOrientation);
}

function onlyY(src) {
    const euler = new THREE.Euler();
    euler.setFromQuaternion(src, 'YXZ');
    euler.x = 0;
    euler.z = 0;
    return new THREE.Quaternion().setFromEuler(euler);
}
