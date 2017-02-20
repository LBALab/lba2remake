
export function createAudioManager() {
    const audio = {
        context: createAudioContext()
    };

    audio.getMusicSource = () => getAudioSource(audio.context);
    audio.getSfxSource = () => getAudioSource(audio.context);

    return audio;
}

function getAudioSource(context) {

    const bufferSource = context.createBufferSource();
    const gainNode = context.createGain();

    const source = {
        volume: 1,
        bufferSource: bufferSource,
        gainNode: gainNode,
        play: () => { bufferSource.start(); },
        stop: () => { bufferSource.stop(); },
        pause: () => {},
        load: (file, callback) => {
            loadAudioAsync(context, file, function (buffer) {
                source.bufferSource.buffer = buffer;
                callback.call();
            });
        }
    };

    source.bufferSource.connect(source.gainNode);
    source.gainNode.gain.value = source.volume;
    source.gainNode.connect(context.destination);
    source.bufferSource.connect(context.destination);

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
