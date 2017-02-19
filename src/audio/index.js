
import {createAudioContext} from './api';

export function getAudioManager() {
    const audio = {
        context: createAudioContext(),
        play: () => {},
        stop: () => {},
        pause: () => {}
    };

    return audio;
}
