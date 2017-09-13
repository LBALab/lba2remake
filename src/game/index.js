// @flow

import THREE from 'three';
import async from 'async';

import {loadHqrAsync} from '../hqr';
import {createRenderer} from '../renderer';
import {makeFirstPersonMouseControls} from '../controls/mouse';
import {makeKeyboardControls} from '../controls/keyboard';
import {makeGyroscopeControls} from '../controls/gyroscope';
import {makeGamepadControls} from '../controls/gamepad';
import {makeFirstPersonTouchControls} from '../controls/touch';

import {mainGameLoop} from './loop';
import {createSceneManager} from './scenes';
import {createState} from './state';
import {createAudioManager} from '../audio'

import {loadTexts} from '../scene';

export function createGame(params: Object, isMobile: boolean, callback : Function) {
    let _sceneManager = null;
    let _isPaused = false;
    let _isLoading = false;

    const _clock = new THREE.Clock(false);
    _clock.start();

    const _state = createState();
    const _renderer = createRenderer(params.useVR);
    const _audio = createAudioManager(_state);
    const game = {
        controlsState: {
            heroSpeed: 0,
            heroRotationSpeed: 0,
            cameraSpeed: new THREE.Vector3(),
            cameraLerp: new THREE.Vector3(),
            cameraLookAtLerp: new THREE.Vector3(),
            cameraOrientation: new THREE.Quaternion(),
            cameraHeadOrientation: new THREE.Quaternion(),
            freeCamera: false,
            vr: params.useVR,
            action: 0,
            jump: 0,
            texts: null,
            textIndex: 4 // game text
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
        getAudioManager: () => _audio,
        getRenderer: () => _renderer,

        pause: () => {
            _isPaused = !_isPaused;
            if(_isPaused) {
                _clock.stop();
                console.log("Pause");
            } else {
                _clock.start();
            }
        },
        preload: (callback: any) => {
            async.auto({
                ress: preloadFileAsync('data/RESS.HQR'),
                text: preloadFileAsync('data/TEXT.HQR'),
                voxgame: preloadFileAsync(`data/VOX/${_state.config.languageCode}_GAM_AAC.VOX`),
                vox000: preloadFileAsync(`data/VOX/${_state.config.languageCode}_000_AAC.VOX`),
                muslogo: preloadFileAsync('data/MUSIC/LOGADPCM.mp4'),
                mus15: preloadFileAsync('data/MUSIC/JADPCM15.mp4'),
                mus16: preloadFileAsync('data/MUSIC/JADPCM16.mp4')
            }, function(err, files) {
                const loading = document.getElementById('loading');
                loading.style.display = 'none';
                callback();
            });
        },
        run: () => {
            _createSceneManager();
        }
    };

    window.game = game;

    async.auto({
        text: loadHqrAsync('TEXT.HQR')
    }, function(err, files) {
        loadTexts(game.controlsState, files.text);
    });

    const _createSceneManager = () => createSceneManager(game, _renderer, sceneManager => {
        _sceneManager = sceneManager;

        let controls = null;
        if (params.useVR) {
            controls = [
                makeGyroscopeControls(game),
                makeGamepadControls(game)
            ];
            if (!isMobile) {
                controls.push(makeKeyboardControls(game));
            }
        }
        else if (isMobile) {
            controls = [
                makeFirstPersonTouchControls(game),
                makeGamepadControls(game)
            ];
        } else {
            controls = [
                makeFirstPersonMouseControls(_renderer.domElement, game),
                makeKeyboardControls(game),
                makeGamepadControls(game)
            ];
        }

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

function preloadFileAsync(url) {
    return (callback: Function) => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            callback();
        };
        request.send();
    }
}
