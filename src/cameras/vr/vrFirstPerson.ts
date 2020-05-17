import * as THREE from 'three';
import { WORLD_SIZE } from '../../utils/lba';
import sharedData from './sharedData';

const HERO_TARGET_POS = new THREE.Vector3(0, 1.43, 0);

export function getVrFirstPersonCamera(renderer) {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        Math.min(0.004 * WORLD_SIZE, 0.1),
        42 * WORLD_SIZE
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
    const scnCamera = {
        width: window.innerWidth,
        height: window.innerHeight,
        threeCamera: camera,
        controlNode,
        resize(width, height) {
            if (width !== this.width || height || this.height) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                this.width = width;
                this.height = height;
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
            scnCamera.update(scene);
        },
        update: (scene) => {
            const hero = scene.actors[0];
            if (!hero.threeObject)
                return;

            const heroPos = HERO_TARGET_POS.clone();
            heroPos.applyMatrix4(hero.threeObject.matrixWorld);

            controlNode.position.copy(heroPos);
        }
    };
    return scnCamera;
}
