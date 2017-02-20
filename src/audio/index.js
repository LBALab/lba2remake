
export function getAudioManager() {
    const audio = {
        context: createAudioContext(),
        getMusicSource: () => getAudioSource(this.context),
        getSfxSource: () => getAudioSource(this.context)
    };

    return audio;
}

function getAudioSource(context) {
    const source = {
        volume: 1,
        bufferSource: context.createBufferSource(),
        gainNode: context.createGain(),
        play: () => { this.source.start(); },
        stop: () => { this.source.stop(); },
        pause: () => {},
        load: (file, callback) => {
            loadAudioAsync(file, function (buffer) {
                this.source.buffer = buffer;
                this.source.connect(this.gainNode);
                this.gainNode.gain.value = this.volume;
                this.gainNode.connect(context.destination);
                callback.call();
            });
        }
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
