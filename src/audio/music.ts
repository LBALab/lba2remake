import { createSource } from './audioSource';
import { loadResource } from '../resources';

const musicDecodedAudioCache = [];

const createMusicSource = (context: any) => {
    const source = createSource(context);
    const loadPlay = async (index: number) => {
        if (!source.volume) {
            return;
        }
        const resId = `MUSIC_SCENE_${index}`;
        if (musicDecodedAudioCache[index]) {
            source.load(musicDecodedAudioCache[index]);
            source.play();
            return;
        }
        const resource = await loadResource(resId);
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
        play: (index: number) => {
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
        preload: async (index: number) => {
            const resId = `MUSIC_SCENE_${index}`;
            const resource = await loadResource(resId);
            if (!resource) {
                return;
            }
            const entryBuffer = resource.getBuffer();
            musicDecodedAudioCache[index] = await source.decode(entryBuffer.slice(0));
        },
    };
};

export { createMusicSource };
