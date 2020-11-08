import { createSource } from './audioSource';
import { getSample } from '../resources';

const createSampleSource = (context: any, volume: number = 1) => {
    const source = createSource(context, volume);
    const loadPlay = async (index: number, frequency: number = 0x1000, loopCount: number = 0) => {
        if (!source.volume) {
            return;
        }
        const buffer = await getSample(index, context);
        if (buffer) {
            source.setLoopCount(loopCount);
            source.load(buffer);
            source.play(frequency);
            return;
        }
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
