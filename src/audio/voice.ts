import { createSource } from './audioSource';
import { getVoices } from '../resources';

const createVoiceSource = (context: any, volume: number = 1) => {
    const source = createSource(context, volume);
    const loadPlay = async (index: number, textBankId: number, onEndedCallback: any = null) => {
        if (!source.volume) {
            return;
        }
        const resource = await getVoices(textBankId);
        if (!resource) {
            return;
        }
        const entryBuffer = await resource.getEntryAsync(index);
        const buffer = await source.decode(entryBuffer.slice(0));
        source.load(buffer, () => {
            if (source.isPlaying && resource.hasHiddenEntries(index)) {
                loadPlay(resource.getNextHiddenEntry(index), textBankId);
            }
            source.isPlaying = false;
            if (onEndedCallback) {
                onEndedCallback.call();
            }
        });
        source.play();
    };
    return {
        isPlaying: () => {
            return source.isPlaying;
        },
        play: (index: number, textBankId: number, onEndedCallback = null) => {
            loadPlay(index, textBankId, onEndedCallback);
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

export { createVoiceSource };
