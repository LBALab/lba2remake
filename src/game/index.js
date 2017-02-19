// @flow

import THREE from 'three';
import {createRenderer} from '../renderer';
import {makeFirstPersonMouseControls} from '../controls/mouse';
import {makeKeyboardControls} from '../controls/keyboard';
import {makeGyroscopeControls} from '../controls/gyroscope';
import {makeGamepadControls} from '../controls/gamepad';

import {mainGameLoop} from './loop';
import {createSceneManager} from './scenes';
import {createHero} from './hero';
import {createState} from './state'

export function createGame(params: Object, isMobile: boolean, callback : Function) {
    let _sceneManager = null;
    let _isPaused = false;

    const _clock = new THREE.Clock(false);
    _clock.start();

    const _state = createState();

    const _renderer = createRenderer(isMobile);
    const _hero = createHero(_state.config.hero);

    const game = {
        controlsState: {
            heroSpeed: 0,
            heroRotationSpeed: 0,
            cameraSpeed: new THREE.Vector3(),
            cameraOrientation: new THREE.Quaternion(),
            cameraHeadOrientation: new THREE.Quaternion(),
            freeCamera: false
        },
        loading: () => {
            _isPaused = true;
            console.log("Loading...");
        },
        loaded: () => {
            _isPaused = false;
            console.log("       ...complete!");
        },

        isPause: _isPaused,

        getSceneManager: () => _sceneManager,
        getState: () => _state,

        pause: () => {
            _isPaused = !_isPaused;
            if(_isPaused) {
                _clock.stop();
                console.log("Pause");
            } else {
                _clock.start();
            }
        },
        run: () => {
            _createSceneManager();
        }
    };

    window.game = game;

    const _createSceneManager = () => createSceneManager(game, _renderer, _hero, sceneManager => {
        _sceneManager = sceneManager;
        game.loading();

        const controls = isMobile ? [
            makeGyroscopeControls(_hero.physics),
            makeGamepadControls(_hero.physics)
        ] : [
            makeFirstPersonMouseControls(_renderer.domElement, game),
            makeKeyboardControls(game),
            makeGamepadControls(_hero.physics)
        ];

        document.getElementById('main').appendChild(_renderer.domElement);
        sceneManager.goto(parseInt(params.scene) || 0, game.loaded);

        function processAnimationFrame() {
            mainGameLoop(game, _clock, _renderer, sceneManager.getScene(), controls);
            requestAnimationFrame(processAnimationFrame);
        }

        processAnimationFrame();

        callback(sceneManager);
    });

    return game;
}
