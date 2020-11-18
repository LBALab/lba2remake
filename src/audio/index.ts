import * as THREE from 'three';

import { createMusicSource } from './music';
import { createSampleSource } from './sample';
import { createVoiceSource } from './voice';
import { getFrequency } from '../utils/lba';
import { getSample, getVoices } from '../resources';

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

    const musicSource = createMusicSource(context, state.config.musicVolume);
    const menuMusicSource = createMusicSource(menuContext, state.config.musicVolume);
    const voiceSource = createVoiceSource(context, state.config.voiceVolume);

    let listener = null;
    if (state.config.positionalAudio) {
        // @ts-ignore
        THREE.AudioContext.setContext(context);
        listener = new THREE.AudioListener();
        listener.setMasterVolume(state.config.soundFxVolume);
        listener.rotateY(Math.PI);
    }

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

        // samples
        createSamplePositionalAudio: (): THREE.PositionalAudio => {
            const sound = new THREE.PositionalAudio(listener);
            // sound.setRolloffFactor(40);
            // sound.setRefDistance(20);
            // sound.setMaxDistance(10000);
            sound.setVolume(1);
            const filter = sound.context.createBiquadFilter();
            filter.type = 'allpass';
            sound.setFilter(filter);
            return sound;
        },
        createSamplePositionalAudioDefault: (): THREE.PositionalAudio => {
            const sound = new THREE.PositionalAudio(listener);
            const filter = sound.context.createBiquadFilter();
            filter.type = 'allpass';
            sound.setFilter(filter);
            return sound;
        },
        createSampleAudio: (): THREE.Audio => {
            const sound = new THREE.Audio(listener);
            sound.setVolume(1);
            const filter = sound.context.createBiquadFilter();
            filter.type = 'allpass';
            sound.setFilter(filter);
            return sound;
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
                if (sound.isPlaying) {
                    sound.stop();
                }
                sound.play();
            }
        },
        // @ts-ignore
        stopSound: async (sound: any, index?: number) => {
            if (sound.isPlaying) {
                sound.stop();
            }
            // TODO find a way to treat multiple audio sources per actor
        },

        // voice
        playSoundVoice: async (
            sound: any,
            index: number,
            textBankId: number,
            onEndedCallback = null
        ) => {
            const playVoiceSound = async (
                sound2: any,
                index2: number,
                textBankId2: number,
                onEndedCallback2 = null
            ) => {
                // voiceSource.play(index, textBankId, onEndedCallback);
                const resource = await getVoices(textBankId);
                if (!resource) {
                    return;
                }
                const entryBuffer = await resource.getEntryAsync(index2);
                const buffer = await context.decodeAudioData(entryBuffer.slice(0));

                if (buffer) {
                    sound2.setBuffer(buffer);
                    if (sound2.isPlaying) {
                        sound2.stop();
                    }
                    sound2.play();
                    sound2.source.onended = () => {
                        if (sound.isPlaying && resource.hasHiddenEntries(index)) {
                            playVoiceSound(
                                sound2,
                                resource.getNextHiddenEntry(index),
                                textBankId2,
                                onEndedCallback2
                            );
                        }
                        sound2.isPlaying = false;
                        if (onEndedCallback2) {
                            onEndedCallback2.call();
                        }
                    };
                }
            };
            playVoiceSound(
                sound,
                index,
                textBankId,
                onEndedCallback
            );
        },

        // voice
        playVoice: (index: number, textBankId: number, onEndedCallback = null) => {
            voiceSource.play(index, textBankId, onEndedCallback);
        },
        stopVoice: () => {
            voiceSource.stop();
        },

        // invetory, ambience
        playSample: (
            index: number,
            frequency: number = 0x1000,
            loopCount: number = 0,
            volume: number = state.config.soundFxVolume
        ) => {
            const sampleSource = createSampleSource(context, volume);
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
