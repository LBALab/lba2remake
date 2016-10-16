import THREE from 'three';
import {createRenderer} from './renderer';
import {mainGameLoop} from './game/loop';
import {createSceneManager} from './game/scenes';
import {Target, Movement, createHero} from './game/hero';
import {makeFirstPersonMouseControls} from './controls/mouse';
import {makeKeyboardControls} from './controls/keyboard';
import {makeGyroscopeControls} from './controls/gyroscope';
import {makeGamepadControls} from './controls/gamepad';

window.onload = function() {
    const isMobile = /Mobile|webOS|iPhone|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const renderer = createRenderer(isMobile);
    const heroConfig = {
        physics: {
            enabled: true,
            targets: [Target.CAMERA],
            movement: Movement.NORMAL,
            speed: new THREE.Vector3(0.15, 0.3, 0.3)
        }
    };
    const hero = createHero(heroConfig);
    const sceneManager = createSceneManager(renderer, hero);
    const controls = isMobile ? [
            makeGyroscopeControls(hero.physics),
            makeGamepadControls(hero.physics)
        ] : [
            makeFirstPersonMouseControls(renderer.domElement, hero.physics),
            makeKeyboardControls(hero.physics),
            makeGamepadControls(hero.physics)
        ];

    document.getElementById('main').appendChild(renderer.domElement);
    sceneManager.goto(42);

    const clock = new THREE.Clock();
    function processAnimationFrame() {
        mainGameLoop(clock, renderer, sceneManager.getScene(), hero, controls);
        requestAnimationFrame(processAnimationFrame);
    }

    processAnimationFrame();
};
