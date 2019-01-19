import * as THREE from 'three';

import {createState} from './state';
import {createAudioManager, createMusicManager} from '../audio';
import {loadTexts} from '../text';
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
        async preload() {
            const langCode = state.config.languageVoice.code;
            const [menuTexts, gameTexts] = await Promise.all([
                loadTexts(state.config.language, 0),
                loadTexts(state.config.language, 4),
                preloadFile('images/2_screen_menubg_extended.png', 'Menu Background'),
                preloadFile('images/remake_logo.png', 'Logo'),
                preloadFile('data/RESS.HQR', 'Resources'),
                preloadFile(`data/VOX/${langCode}_GAM_AAC.VOX`, 'Main Voices'),
                preloadFile(`data/VOX/${langCode}_000_AAC.VOX`, 'Voices'),
                preloadFile('data/MUSIC/LOGADPCM.mp4', 'Adeline Theme'),
                preloadFile('data/MUSIC/JADPCM15.mp4', 'Main Theme'),
                preloadFile('data/MUSIC/JADPCM16.mp4', 'First Song'),
                preloadFile('data/MUSIC/Track6.mp4', 'Menu Music'),
            ]);
            this.menuTexts = menuTexts;
            this.texts = gameTexts;
        }
    };
}

async function preloadFile(url, name) {
    const send = (eventName, progress?) => {
        if (name) {
            document.dispatchEvent(new CustomEvent(eventName, {detail: {name, progress}}));
        }
    };
    return new Promise((resolve: Function, reject: Function) => {
        send('loaderprogress', 0);
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onprogress = (event) => {
            const progress = event.loaded / event.total;
            send('loaderprogress', progress);
        };
        request.onload = function onload() {
            if (this.status === 200) {
                send('loaderend');
                resolve();
            } else {
                reject(`Failed to load resource: status=${this.status}`);
            }
        };
        request.onerror = (err) => {
            reject(err);
        };
        request.send();
    });
}
