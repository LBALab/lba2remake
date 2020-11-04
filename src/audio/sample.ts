import { createSource } from './audioSource';
import { getSamples } from '../resources';

const sampleDecodedAudioCache = [];

const createSampleSource = (context: any) => {
    const source = createSource(context);
    const load = async (index: number) => {
        if (sampleDecodedAudioCache[index]) {
            return sampleDecodedAudioCache[index];
        }
        const resource = await getSamples();
        if (!resource) {
            return null;
        }
        const entryBuffer = await resource.getEntryAsync(index);
        if (entryBuffer.byteLength === 0) {
            return null;
        }
        const buffer = await source.decode(entryBuffer.slice(0));
        sampleDecodedAudioCache[index] = buffer;
        return buffer;
    };
    const loadPlay = async (index: number, frequency: number = 0x1000, loopCount: number = 0) => {
        if (!source.volume) {
            return;
        }
        const buffer = load(index);
        if (buffer) {
            source.setLoopCount(loopCount);
            source.load(sampleDecodedAudioCache[index]);
            source.play(frequency);
            return;
        }
    };
    return {
        isPlaying: () => {
            return source.isPlaying;
        },
        load,
        play: (index: number, frequency: number = 0x1000, loopCount: number = 0) => {
            loadPlay(index, frequency, loopCount);
        },
        stop: () => {
            source.stop();
        },
        setVolume: (vol: number) => {
            source.setVolume(vol);
        },
        pause: () => {
            source.suspend();
        },
        resume: () => {
            source.resume();
        }
    };
};

export { createSampleSource };
