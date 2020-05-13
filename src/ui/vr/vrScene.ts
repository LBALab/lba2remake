import * as THREE from 'three';
import { getVrFirstPersonCamera } from '../../cameras/vr/vrFirstPerson';
import { createFPSCounter } from './vrFPS';
import { createMenu, updateMenu } from './vrMenu';
import { createVideoScreen } from './vrVideo';

let videoScreen = null;

export function loadVRScene(game, sceneManager, renderer) {
    const threeScene = new THREE.Scene();
    const camera = getVrFirstPersonCamera(renderer);

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
    light.name = 'DirectionalLight';
    threeScene.add(light);

    const ambient = new THREE.AmbientLight(0x404040);
    ambient.name = 'AmbientLight';
    threeScene.add(ambient);

    const fps = createFPSCounter(renderer);
    camera.controlNode.add(fps);

    const menu = createMenu(game, sceneManager, light);
    threeScene.add(menu);

    threeScene.add(camera.controlNode);

    return { threeScene, camera };
}

export function updateVRScene(vrScene, presenting, game, sceneManager) {
    vrScene.threeScene.visible = presenting;
    updateMenu(game, sceneManager);

    const { video } = game.getUiState();
    if (video && videoScreen === null) {
        videoScreen = createVideoScreen(video);
        vrScene.threeScene.add(videoScreen.mesh);
    } else if (!video && videoScreen) {
        vrScene.threeScene.remove(videoScreen.mesh);
        videoScreen.videoElem.pause();
        videoScreen = null;
    }
}
