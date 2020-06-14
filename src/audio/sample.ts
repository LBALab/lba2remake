import { createSource } from './audioSource';
import { loadResource, ResourceType } from '../resources';

const sampleDecodedAudioCache = [];

const createSampleSource = (context: any) => {
    const source = createSource(context);
    const loadPlay = async (index: number, frequency: number = null) => {
        if (!source.volume) {
            return;
        }
        if (sampleDecodedAudioCache[index]) {
            source.load(sampleDecodedAudioCache[index]);
            source.play(frequency);
            return;
        }
        const resource = await loadResource(ResourceType.SAMPLES);
        if (!resource) {
            return;
        }
        const entryBuffer = await resource.getEntryAsync(index);
        source.decode(entryBuffer.slice(0), (buffer: any) => {
            sampleDecodedAudioCache[index] = buffer;
            source.load(buffer);
            source.play(frequency);
        });
    };
    return {
        isPlaying: () => {
            return source.isPlaying;
        },
        play: (index: number, frequency: number = null) => {
            loadPlay(index, frequency);
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
