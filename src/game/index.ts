import * as THREE from 'three';
import * as async from 'async';

import {createState} from './state';
import {createAudioManager, createMusicManager} from '../audio';
import {loadHqrAsync} from '../hqr';
import {loadTextsAsync} from '../text';
import DebugData from '../ui/editor/DebugData';

export function createGame(params: any,
                           clock: any,
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

        /* @inspector(locate) */
        resetState() {
            state = createState();
            this.resetControlsState();
        },

        /* @inspector(locate) */
        resetControlsState() {
            this.controlsState.heroSpeed = 0;
            this.controlsState.heroRotationSpeed = 0;
            this.controlsState.action = 0;
            this.controlsState.jump = 0;
            this.controlsState.fight = 0;
            this.controlsState.crunch = 0;
            this.controlsState.weapon = 0;
        },

        /* @inspector(locate) */
        loading(index: number) {
            isPaused = true;
            isLoading = true;
            clock.stop();
            this.setUiState({loading: true});
            // eslint-disable-next-line no-console
            console.log(`Loading scene #${index}`);
        },

        /* @inspector(locate) */
        loaded(wasPaused: boolean = false) {
            isPaused = wasPaused;
            if (!isPaused) {
                clock.start();
            } else {
                DebugData.firstFrame = true;
            }
            isLoading = false;
            this.setUiState({loading: false});
            // eslint-disable-next-line no-console
            console.log('Loaded!');
        },

        /* @inspector(locate, pure) */
        isPaused: () => isPaused,

        /* @inspector(locate, pure) */
        isLoading: () => isLoading,

        /* @inspector(locate, pure) */
        getState: () => state,

        /* @inspector(locate, pure) */
        getAudioManager: () => audio,

        /* @inspector(locate, pure) */
        getAudioMenuManager: () => audioMenu,

        /* @inspector(locate) */
        togglePause() {
            if (isPaused) {
                this.resume();
            } else {
                this.pause();
            }
        },

        /* @inspector(locate) */
        pause: () => {
            isPaused = true;
            clock.stop();
            const sfxSource = audio.getSoundFxSource();
            sfxSource.suspend();
            const voiceSource = audio.getVoiceSource();
            voiceSource.suspend();
            const musicSource = audio.getMusicSource();
            musicSource.suspend();
            // eslint-disable-next-line no-console
            console.log('Pause');
        },

        /* @inspector(locate) */
        resume: () => {
            const musicSource = audio.getMusicSource();
            musicSource.resume();
            const voiceSource = audio.getVoiceSource();
            voiceSource.resume();
            const sfxSource = audio.getSoundFxSource();
            sfxSource.resume();
            isPaused = false;
            clock.start();
            // eslint-disable-next-line no-console
            console.log('Resume');
        },

        /* @inspector(locate) */
        preload(callback: Function) {
            const that = this;
            async.auto({
                menu: preloadFileAsync('images/2_screen_menubg_extended.png', 'Menu Background'),
                ribbon: preloadFileAsync('images/remake_logo.png', 'Logo'),
                ress: preloadFileAsync('data/RESS.HQR', 'Resources'),
                text: loadHqrAsync('TEXT.HQR'),
                voxgame: preloadFileAsync(`data/VOX/${state.config.languageVoice.code}_GAM_AAC.VOX`, 'Main Voices'),
                vox000: preloadFileAsync(`data/VOX/${state.config.languageVoice.code}_000_AAC.VOX`, 'Voices'),
                muslogo: preloadFileAsync('data/MUSIC/LOGADPCM.mp4', 'Adeline Theme'),
                mus15: preloadFileAsync('data/MUSIC/JADPCM15.mp4', 'Main Theme'),
                mus16: preloadFileAsync('data/MUSIC/JADPCM16.mp4', 'First Song'),
                musmenu: preloadFileAsync('data/MUSIC/Track6.mp4', 'Menu Music'),
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

function preloadFileAsync(url, name) {
    const send = (eventName, progress?) => {
        if (name) {
            document.dispatchEvent(new CustomEvent(eventName, {detail: {name, progress}}));
        }
    };
    return (callback: Function) => {
        send('loaderprogress', 0);
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onprogress = (event) => {
            const progress = event.loaded / event.total;
            send('loaderprogress', progress);
        };
        request.onload = () => {
            send('loaderend');
            callback();
        };
        request.send();
    };
}
