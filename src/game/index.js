// @flow
import * as THREE from 'three';
import async from 'async';

import {createState} from './state';
import {createAudioManager, createMusicManager} from '../audio';
import {loadHqrAsync} from '../hqr';
import {loadTextsAsync} from '../text';

export function createGame(params: Object,
                           clock: Object,
                           setUiState: Function,
                           getUiState: Function) {
    let isPaused = false;
    let isLoading = false;

    let state = createState();

    const audio = createAudioManager(state);
    const audioMenu = createMusicManager(state);

    return {
        setUiState,
        getUiState,
        controlsState: {
            heroSpeed: 0,
            heroRotationSpeed: 0,
            cameraSpeed: new THREE.Vector3(),
            cameraLerp: new THREE.Vector3(),
            cameraLookAtLerp: new THREE.Vector3(),
            cameraOrientation: new THREE.Quaternion(),
            cameraHeadOrientation: new THREE.Quaternion(),
            freeCamera: false,
            action: 0,
            jump: 0,
            fight: 0,
            crunch: 0,
            weapon: 0
        },
        resetState() {
            state = createState();
            this.resetControlsState();
        },
        resetControlsState() {
            this.controlsState.heroSpeed = 0;
            this.controlsState.heroRotationSpeed = 0;
            this.controlsState.action = 0;
            this.controlsState.jump = 0;
            this.controlsState.fight = 0;
            this.controlsState.crunch = 0;
            this.controlsState.weapon = 0;
        },
        loading(index: number) {
            isPaused = true;
            isLoading = true;
            clock.stop();
            this.setUiState({loading: true});
            // eslint-disable-next-line no-console
            console.log(`Loading scene #${index}`);
        },
        loaded() {
            isPaused = false;
            if (!isPaused)
                clock.start();
            isLoading = false;
            this.setUiState({loading: false});
            // eslint-disable-next-line no-console
            console.log('Loaded!');
        },

        isPaused: () => isPaused,
        isLoading: () => isLoading,

        getState: () => state,
        getAudioManager: () => audio,
        getAudioMenuManager: () => audioMenu,

        togglePause() {
            if (isPaused) {
                this.resume();
            } else {
                this.pause();
            }
        },
        pause: () => {
            isPaused = true;
            clock.stop();
            // eslint-disable-next-line no-console
            console.log('Pause');
        },
        resume: () => {
            isPaused = false;
            clock.start();
            // eslint-disable-next-line no-console
            console.log('Resume');
        },
        preload(callback: Function) {
            const that = this;
            async.auto({
                loading: preloadFileAsync('images/30_screen_loading.png'),
                menu: preloadFileAsync('images/2_screen_menubg_extended.png'),
                ribbon: preloadFileAsync('images/11_sprite_lba2.png'),
                ress: preloadFileAsync('data/RESS.HQR'),
                text: loadHqrAsync('TEXT.HQR'),
                voxgame: preloadFileAsync(`data/VOX/${state.config.languageVoice.code}_GAM_AAC.VOX`),
                vox000: preloadFileAsync(`data/VOX/${state.config.languageVoice.code}_000_AAC.VOX`),
                muslogo: preloadFileAsync('data/MUSIC/LOGADPCM.mp4'),
                mus15: preloadFileAsync('data/MUSIC/JADPCM15.mp4'),
                mus16: preloadFileAsync('data/MUSIC/JADPCM16.mp4'),
                musmenu: preloadFileAsync('data/MUSIC/Track6.mp4'),
                loadMenuText: loadTextsAsync(state.config.language, 0),
                loadGameText: loadTextsAsync(state.config.language, 4)
            }, (err, files) => {
                that.menuTexts = files.loadMenuText;
                that.texts = files.loadGameText;
                callback();
            });
        }
    };
}

function preloadFileAsync(url) {
    return (callback: Function) => {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            callback();
        };
        request.send();
    };
}
