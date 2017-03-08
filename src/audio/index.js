import async from 'async';

import AudioData from './data'
import {loadHqrAsync} from '../hqr'

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

export function createAudioManager() {
    const context = createAudioContext();
    const musicSource = getMusicSource(context, AudioData.MUSIC);
    const sfxSource = getSoundFxSource(context);
    const audio = {
        context: context,
        getMusicSource: () => musicSource,
        getSoundFxSource: () => sfxSource
    };
    return audio;
}

function getMusicSource(context, data) {
    const source = {
        volume: 0.8,
        isPlaying: false,
        currentIndex: -1,
        bufferSource: null,
        gainNode: context.createGain(),
        pause: () => {},
        data: data
    };

    source.onended = () => {
        source.isPlaying = false;
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
        if (musicSourceCache[index]) {
            source.bufferSource.buffer = musicSourceCache[index];
            source.connect();
            callback.call();
        } else {
            const file = source.data[index].file;
            loadAudioAsync(context, file, function (buffer) {
                source.bufferSource.buffer = buffer;
                musicSourceCache[index] = source.bufferSource.buffer;
                source.connect();
                callback.call();
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

function getSoundFxSource(context, data) {
    const source = {
        volume: 0.8,
        isPlaying: false,
        currentIndex: -1,
        bufferSource: null,
        gainNode: context.createGain(),
        pause: () => {},
        data: data
    };

    source.onended = () => {
        source.isPlaying = false;
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
        if (samplesSourceCache[index]) {
            source.bufferSource.buffer = samplesSourceCache[index];
            source.connect();
            callback.call();
        } else {
            async.auto({
                samples: loadHqrAsync('SAMPLES.HQR')
            }, function(err, files) {
                const buffer = files.samples.getEntry(index);
                source.bufferSource.buffer = buffer;
                samplesSourceCache[index] = source.bufferSource.buffer;
                source.connect();
                callback.call();
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
