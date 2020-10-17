import { createSource } from './audioSource';
import { getMusic } from '../resources';

const musicDecodedAudioCache = [];

const createMusicSource = (context: any) => {
    const source = createSource(context);
    const loadPlay = async (index: number | string) => {
        if (!source.volume) {
            return;
        }
        if (musicDecodedAudioCache[index]) {
            source.load(musicDecodedAudioCache[index]);
            source.play();
            return;
        }
        const resource = await getMusic(index);
        if (!resource) {
            return;
        }
        const entryBuffer = resource.getBuffer();
        const buffer = await source.decode(entryBuffer.slice(0));
        musicDecodedAudioCache[index] = buffer;
        source.load(buffer);
        source.play();
    };
    return {
        isPlaying: () => {
            return source.isPlaying;
        },
        play: (index: number | string) => {
            loadPlay(index);
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
        },
        preload: async (index: number | string) => {
            const resource = await getMusic(index);
            if (!resource) {
                return;
            }
            const entryBuffer = resource.getBuffer();
            musicDecodedAudioCache[index] = await source.decode(entryBuffer.slice(0));
        },
    };
};

export { createMusicSource };
