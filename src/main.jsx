import THREE from 'three';
import {createRenderer} from './renderer';
import {mainGameLoop} from './game/loop';
import {createSceneManager} from './game/scenes';
import {GameEvents} from './game/events';
import {Target, Movement, createHero} from './game/hero';
import {makeFirstPersonMouseControls} from './controls/mouse';
import {makeKeyboardControls} from './controls/keyboard';

window.onload = function() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const renderer = createRenderer(isMobile);
    const hero = createHero({
        physics: {
            targets: [Target.CAMERA],
            movement: Movement.NORMAL,
            speed: new THREE.Vector3(0.15, 0.0, 0.3)
        },
    });
    const sceneManager = createSceneManager(hero);
    const controls = [
        makeFirstPersonMouseControls(renderer.domElement, hero.physics),
        makeKeyboardControls(hero.physics)
    ];

    document.getElementById('main').appendChild(renderer.domElement);
    GameEvents.Scene.GotoIsland.trigger('CITADEL');
    
    const clock = new THREE.Clock();
    function processAnimationFrame() {
        const dt = clock.getDelta();
        mainGameLoop(dt, renderer, sceneManager.currentScene(), hero, controls);
        requestAnimationFrame(processAnimationFrame);
    }

    processAnimationFrame();
};
