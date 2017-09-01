import async from 'async';

import AudioData from './data'
import {loadHqrAsync} from '../hqr'
import {getFrequency} from '../utils/lba'

const musicSourceCache = [];
const samplesSourceCache = [];

function createAudioContext() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext; // needed for Safari
    return new AudioContext();
}

function loadAudioAsync(context, url, callback) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        context.decodeAudioData(request.response, callback, function(err) {
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
    const audio = {
        context: context,
        getMusicSource: () => musicSource,
        getSoundFxSource: () => sfxSource,
        getVoiceSource: () => voiceSource
    };
    return audio;
}

function getMusicSource(state, context, data) {
    const source = {
        volume: state.config.musicVolume,
        isPlaying: false,
        loop: false,
        currentIndex: -1,
        bufferSource: null,
        gainNode: context.createGain(),
        pause: () => {},
        data: data
    };

    source.play = () => {
        source.isPlaying = true;
        source.bufferSource.start();
    };
    source.stop = () => {
        source.bufferSource.stop();
        source.isPlaying = false;
    };
    source.load = (index, callback) => {
        if (index == -1 || source.currentIndex == index) {
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
            loadAudioAsync(context, file, function (buffer) {
                if (!musicSourceCache[index]) { // this bypasses a browser issue while loading same sample in short period of time
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
        source.gainNode.gain.value = source.volume;
        source.gainNode.connect(context.destination);
    };

    return source;
}

function getSoundFxSource(state, context, data) {
    const source = {
        volume: state.config.soundFxVolume,
        isPlaying: false,
        loop: false,
        currentIndex: -1,
        bufferSource: null,
        gainNode: context.createGain(),
        lowPassFilter: context.createBiquadFilter(),
        pause: () => {},
        data: data
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
        source.bufferSource.stop();
        source.isPlaying = false;
    };
    source.load = (index, callback) => {
        async.auto({
            samples: loadHqrAsync('SAMPLES_AAC.HQR')
        }, function(err, files) {
            if (index <= -1 || source.currentIndex == index && source.isPlaying) {
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
                const entryBuffer = files.samples.getEntry(index);
                context.decodeAudioData(entryBuffer, function(buffer) {
                    if (!samplesSourceCache[index]) { // this bypasses a browser issue while loading same sample in short period of time
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
        source.gainNode.gain.value = source.volume;
        source.gainNode.connect(source.lowPassFilter);
        source.lowPassFilter.connect(context.destination);
    };

    return source;
}

function getVoiceSource(state, context, data) {
    const source = {
        volume: state.config.voiceVolume,
        isPlaying: false,
        loop: false,
        currentIndex: -1,
        bufferSource: null,
        gainNode: context.createGain(),
        pause: () => {},
        data: data
    };
    //source.lowPassFilter.type = 'allpass';

    source.play = () => {
        source.isPlaying = true;
        source.bufferSource.start();
    };
    source.stop = () => {
        if (source.isPlaying) {
            source.bufferSource.stop();
        }
        source.isPlaying = false;
    };
    source.load = (index, textBankId, callback) => {
        const textBank = "" + textBankId;
        let filename = `VOX/${state.config.languageCode}_${("000"+textBank).substring(0, 3 - textBank.length)+textBank}_AAC.VOX`;
        if (textBankId == -1) {
            filename = `VOX/${state.config.languageCode}_GAM_AAC.VOX`;
        }
        async.auto({
            voices: loadHqrAsync(filename)
        }, function(err, files) {
            if (index == -1 || source.currentIndex == index && source.isPlaying) {
                return;
            }
            if (source.isPlaying) {
                source.stop();
            }
            source.currentIndex = index;
            source.bufferSource = context.createBufferSource();
            source.bufferSource.onended = () => {
                source.isPlaying = false;
            };

            let entryBuffer = files.voices.getEntry(index);
            context.decodeAudioData(entryBuffer, function(buffer) {
                    if (!source.bufferSource.buffer) {
                        source.bufferSource.buffer = buffer;
                        source.connect();
                        callback.call();
                    }
                }, function(err) {
                    throw new Error(err);
                });
        });
    };

    source.connect = () => {
        // source->gain->context
        source.bufferSource.connect(source.gainNode);
        source.gainNode.gain.value = source.volume;
        source.gainNode.connect(context.destination);
    };

    return source;
}
