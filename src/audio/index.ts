import AudioData from './data';
import {loadHqr} from '../hqr';
import {getFrequency} from '../utils/lba';

const musicSourceCache = [];
const samplesSourceCache = [];

declare global {
    interface Window {
        AudioContext?: any;
        webkitAudioContext?: any;
    }
}

function createAudioContext() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext; // needed for Safari
    return new AudioContext();
}

function loadAudioAsync(context, url, callback) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
        if (request.status === 404) {
            callback(null);
            return;
        }
        context.decodeAudioData(request.response, callback, (err) => {
            throw new Error(err);
        });
    };
    request.send();
}

export function createAudioManager(state) {
    const context = createAudioContext();
    const musicSource = getMusicSource(state, context, AudioData.MUSIC);
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
    const musicSource = getMusicSource(state, context, AudioData.MUSIC);
    return {
        context,
        getMusicSource: () => musicSource
    };
}

function getMusicSource(state, context, data) {
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
        connect: null,
        pause: () => {},
        data
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

        if (musicSourceCache[index]) {
            source.bufferSource.buffer = musicSourceCache[index];
            source.connect();
            callback.call();
        } else {
            const file = source.data[index].file;
            loadAudioAsync(context, file, (buffer) => {
                if (!buffer)
                    return;

                // this bypasses a browser issue while loading same sample in short period of time
                if (!musicSourceCache[index]) {
                    if (!source.bufferSource.buffer) {
                        source.bufferSource.buffer = buffer;
                        musicSourceCache[index] = buffer;
                        source.connect();
                        callback.call();
                    }
                }
            });
        }
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
    source.load = (index, callback) => {
        loadHqr('SAMPLES_AAC.HQR.zip', true)
            .then(async (samples) => {
            if (!samples) {
                return;
            }
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

            if (samplesSourceCache[index]) {
                source.bufferSource.buffer = samplesSourceCache[index];
                source.connect();
                callback.call();
            } else {
                const entryBuffer = await samples.getEntryAsync(index);
                context.decodeAudioData(entryBuffer, (buffer) => {
                    // this bypasses a browser issue while loading same sample
                    // in short period of time.
                    if (!samplesSourceCache[index]) {
                        if (!source.bufferSource.buffer) {
                            source.bufferSource.buffer = buffer;
                            samplesSourceCache[index] = buffer;
                            source.connect();
                            callback.call();
                        }
                    }
                });
            }
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
    source.load = (index, textBankId, callback) => {
        const textBank = `${textBankId}`;
        // tslint:disable-next-line:max-line-length
        let filename = `VOX/${state.config.languageVoice.code}_${(`000${textBank}`).substring(0, 3 - textBank.length) + textBank}_AAC.VOX.zip`;
        if (textBankId === -1) {
            filename = `VOX/${state.config.languageVoice.code}_GAM_AAC.VOX.zip`;
        }
        loadHqr(filename, true).then(async (voices) => {
            if (!voices) {
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
                if (source.isPlaying && voices.hasHiddenEntries(index)) {
                    source.load(voices.getNextHiddenEntry(index), textBankId, callback);
                }
                source.isPlaying = false;
                if (source.ended) {
                    source.ended();
                }
            };

            const entryBuffer = await voices.getEntryAsync(index);
            context.decodeAudioData(entryBuffer, (buffer) => {
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
