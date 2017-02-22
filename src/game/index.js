// @flow

import THREE from 'three';
import {createRenderer} from '../renderer';
import {makeFirstPersonMouseControls} from '../controls/mouse';
import {makeKeyboardControls} from '../controls/keyboard';
import {makeGyroscopeControls} from '../controls/gyroscope';
import {makeGamepadControls} from '../controls/gamepad';

import {mainGameLoop} from './loop';
import {createSceneManager} from './scenes';
import {createState} from './state';

export function createGame(params: Object, isMobile: boolean, callback : Function) {
    let _sceneManager = null;
    let _isPaused = false;
    let _isLoading = false;

    const _clock = new THREE.Clock(false);
    _clock.start();

    const _state = createState();

    const _renderer = createRenderer(isMobile);

    const game = {
        controlsState: {
            heroSpeed: 0,
            heroRotationSpeed: 0,
            cameraSpeed: new THREE.Vector3(),
            cameraOrientation: new THREE.Quaternion(),
            cameraHeadOrientation: new THREE.Quaternion(),
            freeCamera: false
        },
        loading: (index: number) => {
            _isPaused = true;
            _isLoading = true;
            console.log(`Loading scene #${index}`);
        },
        loaded: () => {
            _isPaused = false;
            _isLoading = false;
            console.log("Loaded!");
        },

        isPaused: () => _isPaused,
        isLoading: () => _isLoading,

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

    const _createSceneManager = () => createSceneManager(game, _renderer, sceneManager => {
        _sceneManager = sceneManager;

        const controls = isMobile ? [
            makeGyroscopeControls(game),
            makeGamepadControls(game)
        ] : [
            makeFirstPersonMouseControls(_renderer.domElement, game),
            makeKeyboardControls(game),
            makeGamepadControls(game)
        ];

        document.getElementById('main').appendChild(_renderer.domElement);
        sceneManager.goto(parseInt(params.scene) || 0);

        function processAnimationFrame() {
            mainGameLoop(game, _clock, _renderer, sceneManager.getScene(), controls);
            requestAnimationFrame(processAnimationFrame);
        }

        processAnimationFrame();

        callback(sceneManager);
    });

    return game;
}
