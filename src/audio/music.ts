import { createSource } from './audioSource';
import { getMusic } from '../resources';

const musicDecodedAudioCache = [];

const createMusicSource = (context: any, volume: number = 1) => {
    const source = createSource(context, volume);
    let playingIndex = -1;
    const loadPlay = async (index: number | string, callback = null) => {
        if (!source.volume) {
            return;
        }
        const wrappedCallback = () => {
            playingIndex = -1;
            source.isPlaying = false;
            if (callback) {
                callback();
            }
        };
        if (musicDecodedAudioCache[index]) {
            source.load(musicDecodedAudioCache[index]);
            source.bufferSource.onended = wrappedCallback;
            source.play();
            return;
        }
        const resource = await getMusic(index);
        if (!resource) {
            return;
        }
        const entryBuffer = resource.getBuffer();
        try {
            const buffer = await source.decode(entryBuffer.slice(0));
            musicDecodedAudioCache[index] = buffer;
            source.load(buffer);
            source.bufferSource.onended = wrappedCallback;
            source.play();
        } catch (err) {
            // tslint:disable-next-line: no-console
            console.error(`Failed to decode music, index=${index}:`, err);
        }
    };
    return {
        isPlaying: () => {
            return source.isPlaying;
        },
        play: (index: number | string, callback = null) => {
            if (typeof(index) === 'number') {
                playingIndex = index as number;
            }
            loadPlay(index, callback);
        },
        getPlaying(): number {
            return playingIndex;
        },
        stop: () => {
            playingIndex = -1;
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
            try {
                musicDecodedAudioCache[index] = await source.decode(entryBuffer.slice(0));
            } catch (err) {
                // tslint:disable-next-line: no-console
                console.error(`Failed to decode music, index=${index}:`, err);
            }
        },
    };
};

export { createMusicSource };
