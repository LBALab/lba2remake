import { createSource } from './audioSource';
import { getVoices } from '../resources';

const createVoiceSource = (context: any, volume: number = 1) => {
    let playing = false;
    const source = createSource(context, volume);
    const loadPlay = async (index: number, textBankId: number, onEndedCallback: any = null) => {
        if (!source.volume) {
            return;
        }
        const resource = await getVoices(textBankId);
        if (!resource) {
            return;
        }
        const entryBuffer = resource.getEntry(index);
        try {
            playing = true;
            const buffer = await source.decode(entryBuffer.slice(0));
            await new Promise<void>((resolve) => {
                source.load(buffer, () => {
                    resolve();
                });
                source.play();
            });
            const hiddenEntryBuffers = resource.getHiddenEntries(index);
            for (const hiddenEntryBuffer of hiddenEntryBuffers) {
                if (!playing) {
                    break;
                }
                const hiddenBuffer = await source.decode(hiddenEntryBuffer.slice(0));
                await new Promise<void>((resolve) => {
                    source.load(hiddenBuffer, () => {
                        resolve();
                    });
                    source.play();
                });
            }
        } catch (err) {
            // tslint:disable-next-line: no-console
            console.error(`Failed to decode voice, index=${index}, textBankId=${textBankId}:`, err);
        }
        playing = false;
        if (onEndedCallback) {
            onEndedCallback.call();
        }
    };
    return {
        isPlaying: () => {
            return source.isPlaying;
        },
        play: (index: number, textBankId: number, onEndedCallback = null) => {
            loadPlay(index, textBankId, onEndedCallback);
        },
        stop: () => {
            playing = false;
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
