import { createSource } from './audioSource';
import { getSamples } from '../resources';

const sampleDecodedAudioCache = [];

const createSampleSource = (context: any) => {
    const source = createSource(context);
    const loadPlay = async (index: number, frequency: number = 0x1000, loopCount: number = 0) => {
        if (!source.volume) {
            return;
        }
        if (sampleDecodedAudioCache[index]) {
            source.setLoopCount(loopCount);
            source.load(sampleDecodedAudioCache[index]);
            source.play(frequency);
            return;
        }
        const resource = await getSamples();
        if (!resource) {
            return;
        }
        const entryBuffer = await resource.getEntryAsync(index);
        const buffer = await source.decode(entryBuffer.slice(0));
        sampleDecodedAudioCache[index] = buffer;
        source.setLoopCount(loopCount);
        source.load(buffer);
        source.play(frequency);
    };
    return {
        isPlaying: () => {
            return source.isPlaying;
        },
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
