import * as THREE from 'three';

import { createState } from './state';
import { createAudioManager, createMusicManager } from '../audio';
import { getTextFile, loadTexts } from '../text';
import { getLanguageConfig, tr } from '../lang';
import DebugData from '../ui/editor/DebugData';
import { makePure } from '../utils/debug';

import {
    registerStaticResource,
    registerTransientResource,
    preloadResources
} from '../resources';

const registerResources = {
    lba1: () => {
        const { language } = getLanguageConfig();

        registerStaticResource('ANIM', 'LBA1/ANIM.HQR');
        registerStaticResource('BODY', 'LBA1/BODY.HQR');
        registerStaticResource('RESS', 'LBA1/RESS.HQR');
        registerStaticResource('SAMPLES', 'LBA1/SAMPLES.HQR');
        registerStaticResource('SCENE', 'LBA1/SCENE.HQR');
        registerStaticResource('SPRITES', 'LBA1/SPRITES.HQR');
        registerStaticResource('TEXT', getTextFile(language)); // get fan translated files

        // different assets from both games
        registerStaticResource('ENTITIES', 'LBA1/FILE3D.HQR');
        registerStaticResource('OBJECTS', 'LBA1/INVOBJ.HQR');
        registerStaticResource('LAYOUTS', 'LBA1/LBA_BLL.HQR');
        registerStaticResource('BRICKS', 'LBA1/LBA_BRK.HQR');
        registerStaticResource('GRIDS', 'LBA1/LBA_GRI.HQR');
        registerStaticResource('MUSIC', 'LBA1/MIDI_MI_WIN.HQR');
    },
    lba2: () => {
        const { language, languageVoice } = getLanguageConfig();

        registerStaticResource('ANIM', 'ANIM.HQR');
        registerStaticResource('BODY', 'BODY.HQR');
        registerStaticResource('RESS', 'RESS.HQR');
        registerStaticResource('SAMPLES', 'SAMPLES_AAC.HQR.zip');
        registerStaticResource('SCENE', 'SCENE.HQR');
        registerStaticResource('SPRITES', 'SPRITES.HQR');
        registerStaticResource('SPRITERAW', 'SPRIRAW.HQR');
        registerStaticResource('TEXT', getTextFile(language)); // get fan translated files

        // different assets from both games
        // registerStaticResource('ENTITIES', 'RESS.HQR'); // entry
        registerStaticResource('OBJECTS', 'OBJFIX.HQR');
        // registerStaticResource('LAYOUTS', 'LBA_BKG.HQR'); // entries
        registerStaticResource('BRICKS', 'LBA_BKG.HQR'); // entries
        // registerStaticResource('GRIDS', 'LBA_BKG.HQR'); // entries

        registerStaticResource(tr('MenuBackground'), '../images/2_screen_menubg_extended.png');
        registerStaticResource(tr('Logo'), '../images/remake_logo.png');

        registerStaticResource(tr('AdelineTheme'), 'MUSIC/LOGADPCM.mp4');
        registerStaticResource(tr('MainTheme'), 'MUSIC/JADPCM15.mp4');
        registerStaticResource(tr('FirstSong'), 'MUSIC/JADPCM16.mp4');
        registerStaticResource(tr('MenuMusic'), 'MUSIC/Track6.mp4');

        registerStaticResource('VOICES-GAM', `VOX/${languageVoice.code}_GAM_AAC.VOX.zip`);
        registerStaticResource('VOICES-000', `VOX/${languageVoice.code}_000_AAC.VOX.zip`);

        // Transient resources
        registerTransientResource('VOICES-001', `VOX/${languageVoice.code}_001_AAC.VOX.zip`);
        registerTransientResource('VOICES-002', `VOX/${languageVoice.code}_002_AAC.VOX.zip`);
        registerTransientResource('VOICES-003', `VOX/${languageVoice.code}_003_AAC.VOX.zip`);
        registerTransientResource('VOICES-004', `VOX/${languageVoice.code}_004_AAC.VOX.zip`);
        registerTransientResource('VOICES-005', `VOX/${languageVoice.code}_005_AAC.VOX.zip`);
        registerTransientResource('VOICES-006', `VOX/${languageVoice.code}_006_AAC.VOX.zip`);
        registerTransientResource('VOICES-007', `VOX/${languageVoice.code}_007_AAC.VOX.zip`);
        registerTransientResource('VOICES-008', `VOX/${languageVoice.code}_008_AAC.VOX.zip`);
        registerTransientResource('VOICES-009', `VOX/${languageVoice.code}_009_AAC.VOX.zip`);
        registerTransientResource('VOICES-010', `VOX/${languageVoice.code}_010_AAC.VOX.zip`);
        registerTransientResource('VOICES-011', `VOX/${languageVoice.code}_010_AAC.VOX.zip`);

        registerTransientResource('ASCENCE-ILE',  'ASCENCE.ILE');
        registerTransientResource('ASCENCE-OBL',  'ASCENCE.OBL');
        registerTransientResource('CELEBRA2-ILE', 'CELEBRA2.ILE');
        registerTransientResource('CELEBRA2-OBL', 'CELEBRA2.OBL');
        registerTransientResource('CELEBRAT-ILE', 'CELEBRAT.ILE');
        registerTransientResource('CELEBRAT-OBL', 'CELEBRAT.OBL');
        registerTransientResource('CITABAU-ILE',  'CITABAU.ILE');
        registerTransientResource('CITABAU-OBL',  'CITABAU.OBL');
        registerTransientResource('CITADEL-ILE',  'CITADEL.ILE');
        registerTransientResource('CITADEL-OBL',  'CITADEL.OBL');
        registerTransientResource('DESERT-ILE',   'DESERT.ILE');
        registerTransientResource('DESERT-OBL',   'DESERT.OBL');
        registerTransientResource('EMERAUDE-ILE', 'EMERAUDE.ILE');
        registerTransientResource('EMERAUDE-OBL', 'EMERAUDE.OBL');
        registerTransientResource('ILOTCX-ILE',   'ILOTCX.ILE');
        registerTransientResource('ILOTCX-OBL',   'ILOTCX.OBL');
        registerTransientResource('KNARTAS-ILE',  'KNARTAS.ILE');
        registerTransientResource('KNARTAS-OBL',  'KNARTAS.OBL');
        registerTransientResource('MOON-ILE',     'MOON.ILE');
        registerTransientResource('MOON-OBL',     'MOON.OBL');
        registerTransientResource('MOSQUIBE-ILE', 'MOSQUIBE.ILE');
        registerTransientResource('MOSQUIBE-OBL', 'MOSQUIBE.OBL');
        registerTransientResource('OTRINGAL-ILE', 'OTRINGAL.ILE');
        registerTransientResource('OTRINGAL-OBL', 'OTRINGAL.OBL');
        registerTransientResource('PLATFORM-ILE', 'PLATFORM.ILE');
        registerTransientResource('PLATFORM-OBL', 'PLATFORM.OBL');
        registerTransientResource('SOUSCELB-ILE', 'SOUSCELB.ILE');
        registerTransientResource('SOUSCELB-OBL', 'SOUSCELB.OBL');
    },
};

export function createGame(clock: any, setUiState: Function, getUiState: Function, params: any) {
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
            altControlVector: new THREE.Vector2(),
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
            console.log(`Loading scene #${index}...`);
        },

        loaded(what: string, wasPaused: boolean = false) {
            isPaused = wasPaused;
            if (!isPaused) {
                clock.start();
            } else {
                DebugData.firstFrame = true;
            }
            isLoading = false;
            this.setUiState({loading: false});
            // tslint:disable-next-line:no-console
            console.log(`Loaded ${what}!`);
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

        registerResources: registerResources[params.game],

        async preload() {
            await preloadResources();

            const { language } = getLanguageConfig();
            const [menuTexts, gameTexts] = await Promise.all([
                loadTexts(language, 0),
                loadTexts(language, 4)
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

function getSavedVRFirstPersonMode() {
    const firstPerson = localStorage.getItem('vrFirstPerson');
    if (firstPerson !== null && firstPerson !== undefined) {
        return JSON.parse(firstPerson);
    }
    return false;
}
