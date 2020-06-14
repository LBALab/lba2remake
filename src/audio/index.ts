import { getFrequency } from '../utils/lba';
import {
    ResourceType,
    loadResource,
} from '../resources';
import { createMusicSource } from './music';
import { createVoiceSource } from './voice';

declare global {
    interface Window {
        AudioContext?: any;
        webkitAudioContext?: any;
    }
}

const MUSIC_THEME = 6;

const soundFxDecodedAudioCache = [];

function createAudioContext() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext; // needed for Safari
    return new AudioContext();
}

export function createAudioManager(state) {
    const context = createAudioContext();
    const menuContext = createAudioContext();

    const musicSource = createMusicSource(context);
    const menuMusicSource = createMusicSource(menuContext);
    const voiceSource = createVoiceSource(context);

    musicSource.setVolume(state.config.musicVolume);
    menuMusicSource.setVolume(state.config.musicVolume);
    voiceSource.setVolume(state.config.voiceVolume);

    const sfxSource = getSoundFxSource(state, context);

    return {
        getSoundFxSource: () => sfxSource,

        // music
        playMusic: (index: number) => {
            if (!musicSource.isPlaying()) {
                musicSource.play(index);
            }
        },
        playMusicTheme: () => {
            if (!menuMusicSource.isPlaying()) {
                menuMusicSource.play(MUSIC_THEME);
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

        // voice
        playVoice: (index: number, textBankId: number, onEndedCallback = null) => {
            voiceSource.play(index, textBankId, onEndedCallback);
        },
        stopVoice: () => {
            voiceSource.stop();
        },

        // shared
        pause: () => {
            sfxSource.suspend();
            voiceSource.pause();
            musicSource.pause();
        },
        resume: () => {
            musicSource.resume();
            voiceSource.resume();
            sfxSource.resume();
        },
    };
}

function getSoundFxSource(state, context, data = null) {
    const source = {
        volume: state.config.soundFxVolume,
        isPlaying: false,
        loop: false,
        currentIndex: -1,
        bufferSource: null,
        gainNode: context.createGain(),
        lowPassFilter: context.createBiquadFilter(),
        play: null,
        stop: null,
        suspend: null,
        resume: null,
        load: null,
        loadAndPlay: null,
        connect: null,
        pause: () => {},
        data
    };
    source.lowPassFilter.type = 'allpass';

    source.play = (frequency) => {
        if (frequency) {
            source.lowPassFilter.frequency.value = getFrequency(frequency);
        }
        source.isPlaying = true;
        source.bufferSource.start();
    };
    source.stop = () => {
        try {
            if (source.bufferSource) {
                source.bufferSource.stop();
            }
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.debug(error);
        }
        source.isPlaying = false;
    };
    source.suspend = () => {
        context.suspend();
    };
    source.resume = () => {
        context.resume();
    };
    source.loadAndPlay = (index) => {
        source.load(index, () => {
            source.play();
        });
    };
    source.load = (index, callback) => {
        if (index <= -1 || (source.currentIndex === index && source.isPlaying)) {
            return;
        }
        if (source.isPlaying) {
            source.stop();
        }
        if (index & 0xFF000000) {
            index = (index >> 8) & 0xFFFF;
        }
        source.currentIndex = index;
        source.bufferSource = context.createBufferSource();
        source.bufferSource.onended = () => {
            source.isPlaying = false;
        };

        const setBuffer = (buffer) => {
            if (!source.bufferSource.buffer) {
                source.bufferSource.buffer = buffer;
                soundFxDecodedAudioCache[index] = buffer;
                source.connect();
                callback.call();
            }
        };

        if (soundFxDecodedAudioCache[index]) {
            setBuffer(soundFxDecodedAudioCache[index]);
            return;
        }
        loadResource(ResourceType.SAMPLES).then(async (resource) => {
            if (!resource) {
                return;
            }
            const entryBuffer = await resource.getEntryAsync(index);
            context.decodeAudioData(entryBuffer.slice(0), setBuffer);
        });
    };

    source.connect = () => {
        // source->gain->context
        source.bufferSource.connect(source.gainNode);
        source.gainNode.gain.setValueAtTime(source.volume, context.currentTime + 1);
        source.gainNode.connect(source.lowPassFilter);
        source.lowPassFilter.connect(context.destination);
    };

    return source;
}
