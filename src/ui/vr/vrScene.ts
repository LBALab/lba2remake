import * as THREE from 'three';
import { getVR3DCamera } from '../../cameras/vr/vr3d';
import { addVRGuiNode } from '../../ui/vr/vrGui';

export function loadVRScene(renderer) {
    const threeScene = new THREE.Scene();
    const camera = getVR3DCamera();

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        'images/skybox/miramar_ft.png',
        'images/skybox/miramar_bk.png',
        'images/skybox/miramar_up.png',
        'images/skybox/miramar_dn.png',
        'images/skybox/miramar_rt.png',
        'images/skybox/miramar_lf.png',
    ]);
    threeScene.background = texture;

    addVRGuiNode(renderer, camera.controlNode);
    threeScene.add(camera.controlNode);
    return { threeScene, camera };
}
