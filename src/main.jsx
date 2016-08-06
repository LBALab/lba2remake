import {createRenderer} from './renderer';
import {mainGameLoop} from './game/loop';
import {createSceneManager} from './game/scenes';
import {GameEvents} from './game/events';

window.onload = function() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const renderer = createRenderer(isMobile);
    const sceneManager = createSceneManager(renderer.camera);
    document.getElementById('main').appendChild(renderer.domElement);

    GameEvents.Scene.GotoIsland.trigger('CITADEL');
    processAnimationFrame();

    function processAnimationFrame() {
        mainGameLoop(renderer, sceneManager.scene);
        requestAnimationFrame(processAnimationFrame);
    }
};
