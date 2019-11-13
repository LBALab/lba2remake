import THREE from 'three';

const CAMERA_HERO_OFFSET = new THREE.Vector3(-5, 0, 5);

export function getVRIsoCamera() {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
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

function processFollowMovement(controlNode, scene, forceUpdate = false) {
    const hero = scene.actors[0];
    if (!hero.threeObject)
        return;

    HERO_POS.set(0, 4, 0);
    HERO_POS.applyMatrix4(hero.threeObject.matrixWorld);
    const cameraPos = HERO_POS.clone();
    cameraPos.add(CAMERA_HERO_OFFSET);

    const distance = cameraPos.distanceTo(controlNode.position);

    if (forceUpdate || distance > 3) {
        controlNode.position.copy(cameraPos);
        controlNode.lookAt(HERO_POS);
    }
}
