import * as THREE from 'three';
import { getVR3DCamera } from '../../cameras/vr/vr3d';
import { createFPSCounter } from './vrFPS';
import { createMenu, updateMenu } from './vrMenu';

export function loadVRScene(game, renderer) {
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

    const light = new THREE.DirectionalLight();
    threeScene.add(light);

    const ambient = new THREE.AmbientLight(0x404040);
    threeScene.add(ambient);

    const fps = createFPSCounter(renderer);
    camera.controlNode.add(fps);

    const menu = createMenu(game, renderer, light);
    threeScene.add(menu);

    threeScene.add(camera.controlNode);
    return { threeScene, camera };
}

export function updateVRScene(vrScene, presenting, game, sceneManager) {
    vrScene.visible = presenting;
    updateMenu(game, sceneManager);
}
