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

    const _clock = new THREE.Clock();
    const _clockGame = new THREE.Clock(false);
    _clockGame.start();

    const _state = createState();

    const _renderer = createRenderer(isMobile);
    const _hero = createHero(_state.config.hero);

    const game = {
        loading: () => {
            _isPaused = true;
            console.log("Loading...");
        },
        loaded: () => {
            _isPaused = false;
            console.log("       ...complete!");
        },

        isPause: _isPaused,

        getRenderer: () => _renderer,

        getSceneManager: () => _sceneManager,
        getState: () => _state,

        pause: () => {
            _isPaused = !_isPaused;
            if(_isPaused) {
                _clockGame.stop();
                console.log("Pause");
            } else {
                _clockGame.start();
            }
        },
        run: () => {
            _createSceneManager();
        }
    };

    const _createSceneManager = () => createSceneManager(game, _renderer, _hero, sceneManager => {
        _sceneManager = sceneManager;
        game.loading();

        const controls = isMobile ? [
            makeGyroscopeControls(_hero.physics),
            makeGamepadControls(_hero.physics)
        ] : [
            makeFirstPersonMouseControls(_renderer.domElement, _hero.physics),
            makeKeyboardControls(_hero.physics, game),
            makeGamepadControls(_hero.physics)
        ];

        document.getElementById('main').appendChild(_renderer.domElement);
        sceneManager.goto(parseInt(params.scene) || 0, game.loaded);

        function processAnimationFrame() {
            mainGameLoop(game, _clock, _clockGame, _renderer, sceneManager.getScene(), _hero, controls);
            requestAnimationFrame(processAnimationFrame);
        }

        processAnimationFrame();

        callback(sceneManager);
    });

    return game;
}
