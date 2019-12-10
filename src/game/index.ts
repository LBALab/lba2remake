import * as THREE from 'three';

import {createState} from './state';
import {createAudioManager, createMusicManager} from '../audio';
import {loadTexts} from '../text';
import {getLanguageConfig, tr} from '../lang';
import DebugData from '../ui/editor/DebugData';
import { makePure } from '../utils/debug';

export function createGame(clock: any, setUiState: Function, getUiState: Function) {
    let isPaused = false;
    let isLoading = false;

    let state = createState();

    const audio = createAudioManager(state);
    const audioMenu = createMusicManager(state);

    const game = {
        setUiState,
        getUiState,
        controlsState: {
            controlVector: new THREE.Vector2(),
            cameraSpeed: new THREE.Vector3(),
            cameraLerp: new THREE.Vector3(),
            cameraLookAtLerp: new THREE.Vector3(),
            cameraOrientation: new THREE.Quaternion(),
            cameraHeadOrientation: new THREE.Quaternion(),
            freeCamera: false,
            relativeToCam: false,
            firstPerson: getSavedVRFirstPersonMode(),
            action: 0,
            jump: 0,
            fight: 0,
            crunch: 0,
            weapon: 0,
            ctrlTriggers: []
        },

        resetState() {
            state = createState();
            this.resetControlsState();
        },

        resetControlsState() {
            this.controlsState.controlVector.set(0, 0),
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
            // tslint:disable-next-line:no-console
            console.log(`Loading scene #${index}`);
        },

        loaded(wasPaused: boolean = false) {
            isPaused = wasPaused;
            if (!isPaused) {
                clock.start();
            } else {
                DebugData.firstFrame = true;
            }
            isLoading = false;
            this.setUiState({loading: false});
            // tslint:disable-next-line:no-console
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

        getTime: () => {
            return {
                delta: Math.min(clock.getDelta(), 0.025),
                elapsed: clock.getElapsedTime(),
            };
        },

        pause: () => {
            isPaused = true;
            clock.stop();
            const sfxSource = audio.getSoundFxSource();
            sfxSource.suspend();
            const voiceSource = audio.getVoiceSource();
            voiceSource.suspend();
            const musicSource = audio.getMusicSource();
            musicSource.suspend();
            // tslint:disable-next-line:no-console
            console.log('Pause');
        },

        resume: () => {
            if (isPaused) {
                const musicSource = audio.getMusicSource();
                musicSource.resume();
                const voiceSource = audio.getVoiceSource();
                voiceSource.resume();
                const sfxSource = audio.getSoundFxSource();
                sfxSource.resume();
                isPaused = false;
                clock.start();
                // tslint:disable-next-line:no-console
                console.log('Resume');
            }
        },

        async preload() {
            const {language, languageVoice} = getLanguageConfig();
            const [menuTexts, gameTexts] = await Promise.all([
                loadTexts(language, 0),
                loadTexts(language, 4),
                preloadFile('images/2_screen_menubg_extended.png', tr('MenuBackground')),
                preloadFile('images/remake_logo.png', tr('Logo')),
                preloadFile('data/RESS.HQR', tr('Resources')),
                preloadFile(`data/VOX/${languageVoice.code}_GAM_AAC.VOX`, tr('MainVoices')),
                preloadFile(`data/VOX/${languageVoice.code}_000_AAC.VOX`, tr('Voices')),
                preloadFile('data/MUSIC/LOGADPCM.mp4', tr('AdelineTheme')),
                preloadFile('data/MUSIC/JADPCM15.mp4', tr('MainTheme')),
                preloadFile('data/MUSIC/JADPCM16.mp4', tr('FirstSong')),
                preloadFile('data/MUSIC/Track6.mp4', tr('MenuMusic')),
            ]);
            this.menuTexts = menuTexts;
            this.texts = gameTexts;
        }
    };

    makePure(game.isPaused);
    makePure(game.isLoading);
    makePure(game.getState);
    makePure(game.getAudioManager);
    makePure(game.getAudioMenuManager);

    return game;
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

function getSavedVRFirstPersonMode() {
    const firstPerson = localStorage.getItem('vrFirstPerson');
    if (firstPerson !== null && firstPerson !== undefined) {
        return JSON.parse(firstPerson);
    }
    return false;
}
