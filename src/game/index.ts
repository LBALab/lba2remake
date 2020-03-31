import * as THREE from 'three';

import { createState } from './state';
import { createAudioManager, createMusicManager } from '../audio';
import { getTextFile, loadTexts } from '../text';
import { getLanguageConfig } from '../lang';
import DebugData from '../ui/editor/DebugData';
import { makePure } from '../utils/debug';

import {
    registerStaticResource,
    registerTransientResource,
    preloadResources,
    ResourceType,
} from '../resources';

const registerResources = {
    lba1: () => {
        const { language } = getLanguageConfig();

        registerStaticResource(ResourceType.ANIM, 'LBA1/ANIM.HQR');
        registerStaticResource(ResourceType.BODY, 'LBA1/BODY.HQR');
        registerStaticResource(ResourceType.RESS, 'LBA1/RESS.HQR');
        registerStaticResource(ResourceType.PALETTE, 'LBA1/RESS.HQR', 0);
        registerStaticResource(ResourceType.SAMPLES, 'LBA1/SAMPLES.HQR');
        registerStaticResource(ResourceType.SCENE, 'LBA1/SCENE.HQR');
        registerStaticResource(ResourceType.SPRITES, 'LBA1/SPRITES.HQR');
        registerStaticResource(ResourceType.TEXT, getTextFile(language));

        registerStaticResource(ResourceType.ENTITIES, 'LBA1/FILE3D.HQR');
        registerStaticResource(ResourceType.OBJECTS, 'LBA1/INVOBJ.HQR');
        registerStaticResource(ResourceType.LAYOUTS, 'LBA1/LBA_BLL.HQR');
        registerStaticResource(ResourceType.BRICKS, 'LBA1/LBA_BRK.HQR');
        registerStaticResource(ResourceType.GRIDS, 'LBA1/LBA_GRI.HQR');
        registerStaticResource(ResourceType.MUSIC, 'LBA1/MIDI_MI_WIN.HQR');
    },
    lba2: () => {
        const { language, languageVoice } = getLanguageConfig();

        registerStaticResource(ResourceType.ANIM, 'ANIM.HQR');
        registerStaticResource(ResourceType.BODY, 'BODY.HQR');
        registerStaticResource(ResourceType.RESS, 'RESS.HQR');
        registerStaticResource(ResourceType.ENTITIES, 'RESS.HQR', 44);
        registerStaticResource(ResourceType.PALETTE, 'RESS.HQR', 0);
        registerStaticResource(ResourceType.SAMPLES, 'SAMPLES_AAC.HQR.zip');
        registerStaticResource(ResourceType.SCENE, 'SCENE.HQR');
        registerStaticResource(ResourceType.SPRITES, 'SPRITES.HQR');
        registerStaticResource(ResourceType.SPRITERAW, 'SPRIRAW.HQR');
        registerStaticResource(ResourceType.TEXT, getTextFile(language));

        registerStaticResource(ResourceType.OBJECTS, 'OBJFIX.HQR');
        registerStaticResource(ResourceType.LAYOUTS, 'LBA_BKG.HQR');
        registerStaticResource(ResourceType.BRICKS, 'LBA_BKG.HQR');
        registerStaticResource(ResourceType.GRIDS, 'LBA_BKG.HQR');

        registerStaticResource(ResourceType.MENU_BACKGROUND,
            '../images/2_screen_menubg_extended.png');
        registerStaticResource(ResourceType.LOGO, '../images/remake_logo.png');

        registerStaticResource(ResourceType.THEME_ADELINE, 'MUSIC/LOGADPCM.mp4');
        registerStaticResource(ResourceType.THEME_MAIN, 'MUSIC/JADPCM15.mp4');
        registerStaticResource(ResourceType.THEME_MENU, 'MUSIC/Track6.mp4');
        registerStaticResource(ResourceType.MUSIC_TRACK_1, 'MUSIC/JADPCM16.mp4');

        registerStaticResource(ResourceType.VOICESG, `VOX/${languageVoice.code}_GAM_AAC.VOX.zip`);
        registerStaticResource(ResourceType.VOICES0, `VOX/${languageVoice.code}_000_AAC.VOX.zip`);

        // Transient resources
        registerTransientResource(ResourceType.VOICES1,
            `VOX/${languageVoice.code}_001_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES2,
            `VOX/${languageVoice.code}_002_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES3,
            `VOX/${languageVoice.code}_003_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES4,
            `VOX/${languageVoice.code}_004_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES5,
            `VOX/${languageVoice.code}_005_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES6,
            `VOX/${languageVoice.code}_006_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES7,
            `VOX/${languageVoice.code}_007_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES8,
            `VOX/${languageVoice.code}_008_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES9,
            `VOX/${languageVoice.code}_009_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES10,
            `VOX/${languageVoice.code}_010_AAC.VOX.zip`);
        registerTransientResource(ResourceType.VOICES11,
            `VOX/${languageVoice.code}_010_AAC.VOX.zip`);

        registerTransientResource(ResourceType.ASCENCE_ILE,  'ASCENCE.ILE');
        registerTransientResource(ResourceType.ASCENCE_OBL,  'ASCENCE.OBL');
        registerTransientResource(ResourceType.CELEBRA2_ILE, 'CELEBRA2.ILE');
        registerTransientResource(ResourceType.CELEBRA2_OBL, 'CELEBRA2.OBL');
        registerTransientResource(ResourceType.CELEBRAT_ILE, 'CELEBRAT.ILE');
        registerTransientResource(ResourceType.CELEBRAT_OBL, 'CELEBRAT.OBL');
        registerTransientResource(ResourceType.CITABAU_ILE,  'CITABAU.ILE');
        registerTransientResource(ResourceType.CITABAU_OBL,  'CITABAU.OBL');
        registerTransientResource(ResourceType.CITADEL_ILE,  'CITADEL.ILE');
        registerTransientResource(ResourceType.CITADEL_OBL,  'CITADEL.OBL');
        registerTransientResource(ResourceType.DESERT_ILE,   'DESERT.ILE');
        registerTransientResource(ResourceType.DESERT_OBL,   'DESERT.OBL');
        registerTransientResource(ResourceType.EMERAUDE_ILE, 'EMERAUDE.ILE');
        registerTransientResource(ResourceType.EMERAUDE_OBL, 'EMERAUDE.OBL');
        registerTransientResource(ResourceType.ILOTCX_ILE,   'ILOTCX.ILE');
        registerTransientResource(ResourceType.ILOTCX_OBL,   'ILOTCX.OBL');
        registerTransientResource(ResourceType.KNARTAS_ILE,  'KNARTAS.ILE');
        registerTransientResource(ResourceType.KNARTAS_OBL,  'KNARTAS.OBL');
        registerTransientResource(ResourceType.MOON_ILE,     'MOON.ILE');
        registerTransientResource(ResourceType.MOON_OBL,     'MOON.OBL');
        registerTransientResource(ResourceType.MOSQUIBE_ILE, 'MOSQUIBE.ILE');
        registerTransientResource(ResourceType.MOSQUIBE_OBL, 'MOSQUIBE.OBL');
        registerTransientResource(ResourceType.OTRINGAL_ILE, 'OTRINGAL.ILE');
        registerTransientResource(ResourceType.OTRINGAL_OBL, 'OTRINGAL.OBL');
        registerTransientResource(ResourceType.PLATFORM_ILE, 'PLATFORM.ILE');
        registerTransientResource(ResourceType.PLATFORM_OBL, 'PLATFORM.OBL');
        registerTransientResource(ResourceType.SOUSCELB_ILE, 'SOUSCELB.ILE');
        registerTransientResource(ResourceType.SOUSCELB_OBL, 'SOUSCELB.OBL');
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
