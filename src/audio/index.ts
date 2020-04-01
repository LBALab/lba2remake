import { getFrequency } from '../utils/lba';
import {
    ResourceType,
    loadResource,
} from '../resources';

declare global {
    interface Window {
        AudioContext?: any;
        webkitAudioContext?: any;
    }
}

const musicDecodedAudioCache = [];
const soundFxDecodedAudioCache = [];

function createAudioContext() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext; // needed for Safari
    return new AudioContext();
}

export function createAudioManager(state) {
    const context = createAudioContext();
    const musicSource = getMusicSource(state, context);
    const sfxSource = getSoundFxSource(state, context);
    const voiceSource = getVoiceSource(state, context);
    return {
        context,
        getMusicSource: () => musicSource,
        getSoundFxSource: () => sfxSource,
        getVoiceSource: () => voiceSource
    };
}

export function createMusicManager(state) {
    const context = createAudioContext();
    const musicSource = getMusicSource(state, context);
    return {
        context,
        getMusicSource: () => musicSource
    };
}

function getMusicSource(state, context) {
    const source = {
        volume: state.config.musicVolume,
        isPlaying: false,
        loop: false,
        currentIndex: -1,
        bufferSource: null,
        gainNode: context.createGain(),
        play: null,
        stop: null,
        suspend: null,
        resume: null,
        load: null,
        loadAndPlay: null,
        connect: null,
        pause: () => {},
    };

    source.play = () => {
        source.bufferSource.start();
        source.isPlaying = true;
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
        if (index === -1 || (source.currentIndex === index && source.isPlaying)) {
            return;
        }
        if (source.isPlaying) {
            source.stop();
        }
        source.currentIndex = index;
        source.bufferSource = context.createBufferSource();
        source.bufferSource.loop = source.loop;
        source.bufferSource.onended = () => {
            source.isPlaying = false;
        };

        const setBuffer = (buffer) => {
            if (!source.bufferSource.buffer) {
                source.bufferSource.buffer = buffer;
                musicDecodedAudioCache[index] = buffer;
                source.connect();
                callback.call();
            }
        };

        const resId = ResourceType[`MUSIC_SCENE_${index}`];
        if (musicDecodedAudioCache[index]) {
            setBuffer(musicDecodedAudioCache[index]);
            return;
        }
        loadResource(resId).then((resource) => {
            if (!resource) {
                return;
            }
            const entryBuffer = resource.getBuffer();
            context.decodeAudioData(entryBuffer.slice(0), setBuffer);
        });
    };
    source.connect = () => {
        // source->gain->context
        source.bufferSource.connect(source.gainNode);
        source.gainNode.gain.setValueAtTime(source.volume, context.currentTime + 1);
        source.gainNode.connect(context.destination);
    };

    return source;
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

function getVoiceSource(state, context, data = null) {
    const source = {
        volume: state.config.voiceVolume,
        isPlaying: false,
        loop: false,
        currentIndex: -1,
        bufferSource: null,
        gainNode: context.createGain(),
        play: null,
        stop: null,
        suspend: null,
        resume: null,
        load: null,
        loadAndPlay: null,
        connect: null,
        ended: null,
        pause: () => {},
        data
    };
    // source.lowPassFilter.type = 'allpass';

    source.play = () => {
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
    source.load = (index, textBankId, callback) => {
        const textBank = `${textBankId}`;
        let resType: number =
            ResourceType[`VOICES_${(`000${textBank}`)
            .substring(0, 3 - textBank.length) + textBank}`];
        if (textBankId === -1) {
            resType = ResourceType.VOICES_GAM;
        }
        loadResource(resType).then(async (resource) => {
            if (!resource) {
                return;
            }
            if (index === -1 || (source.currentIndex === index && source.isPlaying)) {
                return;
            }
            if (source.isPlaying) {
                source.stop();
            }
            source.currentIndex = index;
            source.bufferSource = context.createBufferSource();

            source.bufferSource.onended = () => {
                if (source.isPlaying && resource.hasHiddenEntries(index)) {
                    source.load(resource.getNextHiddenEntry(index), textBankId, callback);
                }
                source.isPlaying = false;
                if (source.ended) {
                    source.ended();
                }
            };

            const entryBuffer = await resource.getEntryAsync(index);
            context.decodeAudioData(entryBuffer.slice(0), (buffer) => {
                if (!source.bufferSource.buffer) {
                    source.bufferSource.buffer = buffer;
                    source.connect();
                    callback.call();
                }
            }, (decodeErr) => {
                throw new Error(decodeErr);
            });
        });
    };

    source.connect = () => {
        // source->gain->context
        source.bufferSource.connect(source.gainNode);
        source.gainNode.gain.setValueAtTime(source.volume, context.currentTime + 1);
        source.gainNode.connect(context.destination);
    };

    return source;
}
