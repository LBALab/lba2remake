import AudioData from './data'

const musicSourceCache = [];

export function createAudioManager() {
    const context = createAudioContext();
    const musicSource = getAudioSource(context, AudioData.MUSIC);
    const voxSource = getAudioSource(context);
    const audio = {
        context: context,
        getMusicSource: () => musicSource,
        getVoxSource: () => voxSource
    };
    return audio;
}

function getAudioSource(context, data) {
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
