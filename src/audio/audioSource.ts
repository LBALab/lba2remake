import { getFrequency } from '../utils/lba';

interface AudioSource {
    volume: number;
    isPlaying: boolean;
    loop: boolean;
    loopCount: number;
    setVolume: Function;
    setLoopCount: Function;
    play: Function;
    stop: Function;
    suspend: Function;
    resume: Function;
    load: Function;
    decode: Function;
    connect: Function;
    bufferSource: any;
    gainNode: any;
    lowPassFilter: any;
}

const createSource = (context: any): AudioSource => {
    const source: AudioSource = {
        gainNode: context.createGain(),
        lowPassFilter: context.createBiquadFilter(),
        volume: 0,
        isPlaying: false,
        loop: false,
        loopCount: 0,
        setVolume: null,
        setLoopCount: null,
        bufferSource: null,
        play: null,
        stop: null,
        suspend: null,
        resume: null,
        load: null,
        connect: null,
        decode: null,
    };
    source.lowPassFilter.type = 'allpass';

    source.setVolume = (newVolume: number) => {
        source.volume = newVolume;
        source.gainNode.gain.setValueAtTime(source.volume, context.currentTime + 1);
    };

    source.setLoopCount = (loopCount: number) => {
        source.loop = false;
        if (loopCount > 0) {
            source.loopCount = loopCount;
        }
        if (loopCount !== 0) { // -1 (always loop) | > 0 (loopCount)
            source.loop = true;
        }
    };

    source.play = (frequency: number = null) => {
        if (frequency) {
            source.lowPassFilter.frequency.value = getFrequency(frequency);
        }
        if (source.bufferSource) {
            source.bufferSource.start();
            source.isPlaying = true;
        }
    };

    source.stop = () => {
        if (source.bufferSource) {
            source.bufferSource.stop();
        }
        source.isPlaying = false;
    };

    source.suspend = () => {
        context.suspend();
    };

    source.resume = () => {
        context.resume();
    };

    source.decode = async (buffer) => {
        return await context.decodeAudioData(buffer);
    };

    source.connect = () => {
        // source->gain->context
        source.bufferSource.connect(source.gainNode);
        source.gainNode.gain.setValueAtTime(source.volume, context.currentTime + 1);
        source.gainNode.connect(source.lowPassFilter);
        source.lowPassFilter.connect(context.destination);
    };

    source.load = (buffer, onEndedCallback = null) => {
        source.bufferSource = context.createBufferSource();
        source.bufferSource.loop = source.loop;
        source.bufferSource.buffer = buffer;
        source.bufferSource.onended = () => {
            if (source.loop) {
                source.loopCount = source.loopCount - 1;
                if (source.loopCount === 0) {
                    source.loop = false;
                    source.bufferSource.loop = false;
                }
            }
            if (onEndedCallback) {
                onEndedCallback.call();
            }
            source.isPlaying = false;
        };
        source.connect();
    };

    return source;
};

export { createSource };
