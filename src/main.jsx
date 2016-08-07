import {createRenderer} from './renderer';
import {mainGameLoop} from './game/loop';
import {createSceneManager} from './game/scenes';
import {GameEvents} from './game/events';
import {Target, Movement, createHero} from './game/hero';
import {makeMouseFirstPersonControls} from './controls/mouse';
import {makeKeyboardControls} from './controls/keyboard';

window.onload = function() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const renderer = createRenderer(isMobile);
    const hero = createHero({
        physics: {
            targets: [Target.CAMERA],
            movement: Movement.NORMAL
        },
    });
    const sceneManager = createSceneManager(hero);
    const controls = [
        makeMouseFirstPersonControls(renderer.domElement, hero.physics),
        makeKeyboardControls(renderer.domElement, hero.physics)
    ];

    document.getElementById('main').appendChild(renderer.domElement);
    GameEvents.Scene.GotoIsland.trigger('CITADEL');
    processAnimationFrame();

    function processAnimationFrame() {
        mainGameLoop(renderer, sceneManager.currentScene(), hero, controls);
        requestAnimationFrame(processAnimationFrame);
    }
};
