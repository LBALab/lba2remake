import { createSource } from './audioSource';
import { loadResource } from '../resources';

const createVoiceSource = (context: any) => {
    const source = createSource(context);
    const loadPlay = (index: number, textBankId: number, onEndedCallback: any = null) => {
        if (!source.volume) {
            return;
        }
        const textBank = `${textBankId}`;
        let resId = `VOICES_${(`000${textBank}`)
            .substring(0, 3 - textBank.length) + textBank}`;
        if (textBankId === -1) {
            resId = 'VOICES_GAM';
        }
        loadResource(resId).then(async (resource) => {
            if (!resource) {
                return;
            }
            const entryBuffer = await resource.getEntryAsync(index);
            source.decode(entryBuffer.slice(0), (buffer: any) => {
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
            });
        });
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
