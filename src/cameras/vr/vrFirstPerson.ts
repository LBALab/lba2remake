import * as THREE from 'three';

const CAMERA_HERO_OFFSET = new THREE.Vector3(0, 1.6, -0.1);
const HERO_TARGET_POS = new THREE.Vector3(0, 1.6, 0);

export function getVrFirstPersonCamera() {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.name = 'VRFirstPersonCamera';
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
        init: (scene, controlsState) => {
            if (!controlsState.freeCamera) {
                const hero = scene.actors[0];
                if (!hero.threeObject)
                    return;
                const heroPos = HERO_TARGET_POS.clone();
                heroPos.applyMatrix4(hero.threeObject.matrixWorld);

                const cameraPos = CAMERA_HERO_OFFSET.clone();
                cameraPos.applyMatrix4(hero.threeObject.matrixWorld);
                controlNode.position.copy(cameraPos);
                // controlNode.lookAt(heroPos);
            }
        },
        update: (scene) => {
            const hero = scene.actors[0];
            if (!hero.threeObject)
                    return;

            const heroPos = HERO_TARGET_POS.clone();
            const cameraPos = CAMERA_HERO_OFFSET.clone();
            heroPos.applyMatrix4(hero.threeObject.matrixWorld);
            cameraPos.applyMatrix4(hero.threeObject.matrixWorld);

            controlNode.position.copy(cameraPos);
            // controlNode.lookAt(heroPos);
        }
    };
}
