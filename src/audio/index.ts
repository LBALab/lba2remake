import * as THREE from 'three';

import { createMusicSource } from './music';
import { createVoiceSource } from './voice';
import { createSampleSource } from './sample';
import { getFrequency } from '../utils/lba';
import { getSample } from '../resources';

declare global {
    interface Window {
        AudioContext?: any;
        webkitAudioContext?: any;
    }
}

const THEME_MENU = 'THEME_MENU';
const samples = {};

function createAudioContext() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext; // needed for Safari
    return new AudioContext();
}

export function createAudioManager(state) {
    const context = createAudioContext();
    const menuContext = createAudioContext();

    const isActive = (ctx: AudioContext) => ctx.state === 'running';

    const musicSource = createMusicSource(context);
    const menuMusicSource = createMusicSource(menuContext);
    const voiceSource = createVoiceSource(context);

    // tune volumes
    musicSource.setVolume(state.config.musicVolume);
    menuMusicSource.setVolume(state.config.musicVolume);
    voiceSource.setVolume(state.config.voiceVolume);

    // @ts-ignore
    THREE.AudioContext.setContext(context);
    const listener = new THREE.AudioListener();
    listener.setMasterVolume(state.config.soundFxVolume);

    return {
        context,
        menuContext,
        listener,

        dispose: () => {
            context.close();
            menuContext.close();
        },

        // music
        playMusic: (index: number) => {
            menuMusicSource.stop();
            if (!musicSource.isPlaying()) {
                musicSource.play(index);
            }
        },
        playMusicTheme: () => {
            if (!menuMusicSource.isPlaying()) {
                menuMusicSource.play(THEME_MENU);
            }
        },
        isPlayingMusic: () => {
            return musicSource.isPlaying();
        },
        stopMusic: () => {
            musicSource.stop();
        },
        stopMusicTheme: () => {
            menuMusicSource.stop();
        },
        preloadMusicTheme: async () => {
            await menuMusicSource.preload(THEME_MENU);
        },
        resumeMusicTheme: () => {
            menuMusicSource.resume();
        },

        // voice
        playVoice: (index: number, textBankId: number, onEndedCallback = null) => {
            voiceSource.play(index, textBankId, onEndedCallback);
        },
        stopVoice: () => {
            voiceSource.stop();
        },

        // samples
        createSamplePositionalAudio: (): THREE.PositionalAudio => {
            const sound = new THREE.PositionalAudio(listener);
            sound.setDirectionalCone(60, 90, 0.3);
            sound.setRolloffFactor(40);
            sound.setRefDistance(20); // 20
            sound.setMaxDistance(10000);
            sound.setVolume(1);
            sound.setFilter(sound.context.createBiquadFilter());
            return sound;
        },
        createSampleAudio: (): THREE.Audio => {
            const sound = new THREE.Audio(listener);
            sound.setVolume(1);
            sound.setFilter(sound.context.createBiquadFilter());
            return sound;
        },
        // @ts-ignore
        stopSound: async (sound: any, index?: number) => {
            if (sound.isPlaying) {
                sound.stop();
            }
            // TODO find a way to treat multiple audio sources per actor
        },
        playSound: async (
            sound: any,
            index: number,
            frequency: number = 0x1000,
            loopCount: number = 0
        ) => {
            const buffer = await getSample(index, context);
            if (buffer) {
                if (loopCount !== 0) {
                    sound.setLoop(true);
                }
                sound.setLoop(loopCount);
                const lowPassFilter = sound.getFilters()[0];
                lowPassFilter.frequency.value = getFrequency(frequency);
                sound.setBuffer(buffer);
                if (!sound.isPlaying) {
                    sound.play();
                }
            }
        },
        playSample: (index: number, frequency: number = 0x1000, loopCount: number = 0) => {
            const sampleSource = createSampleSource(context);
            sampleSource.setVolume(state.config.soundFxVolume);
            sampleSource.play(index, frequency, loopCount);
            samples[index] = sampleSource;
            return sampleSource;
        },
        isPlayingSample: (index: number) => {
            const sampleSource = samples[index];
            if (sampleSource) {
                return sampleSource.isPlaying();
            }
            return false;
        },
        stopSample: (index: number) => {
            const sampleSource = samples[index];
            if (sampleSource) {
                sampleSource.stop();
            }
        },
        stopSamples: () => {
            Object.keys(samples).forEach((index: string) => {
                const sampleSource = samples[index];
                if (sampleSource) {
                    sampleSource.stop();
                }
            });
        },

        // shared
        pause: () => {
            context.suspend();
        },
        resume: () => {
            context.resume();
        },
        resumeContext: () => {
            if (!isActive(context)) {
                context.resume();
            }
            if (!isActive(menuContext)) {
                menuContext.resume();
            }
        },
        isContextActive: () => {
            return isActive(context) || isActive(menuContext);
        }
    };
}
