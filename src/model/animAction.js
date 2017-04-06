import {each} from 'lodash';

import {AnimActionOpcode} from './data/index';
import {getRandom} from '../utils/lba'

export function processAnimAction(entityAnim, animState) {
    const actions = entityAnim.actions;
    const animFrame = animState.currentFrame;
    each(actions, action => {
       if (action.animFrame == animFrame) {
           const actionType = AnimActionOpcode[action.type];
           if (actionType != null && actionType.callback != null) {
               actionType.callback(action, animState);
           }
       }
    });
}

export function HITTING(action) {

}

export function SAMPLE(action) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play();
    });
}

export function SAMPLE_FREQ(action) {
    let frequency = getRandom(0, action.frequency) + 0x1000 - (action.frequency >> 1);
    if (frequency < 0 || frequency > 24000) {
        frequency = 0;
    }
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play(frequency);
    });
}

export function THROW_EXTRA_BONUS(action) {

}

export function THROW_MAGIC_BALL(action) {

}

export function SAMPLE_REPEAT(action) {

}

export function EXTRA_AIMING(action) {

}

export function EXTRA_THROW(action) {

}

export function SAMPLE_STOP(action) {

}

export function UNKNOWN_14(action) {
}

export function SAMPLE_BRICK_1(action, animState) {
    let sampleIndex = animState.floorSound;
    if (sampleIndex != -1) {
        sampleIndex += 30;
        //const frequency = getRandom(0, 0x1000) + 3596;
        const soundFxSource = game.getAudioManager().getSoundFxSource();
        soundFxSource.load(sampleIndex, () => {
            soundFxSource.play(/*frequency*/);
        });
    }
}

export function SAMPLE_BRICK_2(action, animState) {
    let sampleIndex = animState.floorSound;
    if (sampleIndex != -1) {
        sampleIndex += 30;
        //const frequency = getRandom(0, 0x1000) + 3596;
        const soundFxSource = game.getAudioManager().getSoundFxSource();
        soundFxSource.load(sampleIndex, () => {
            soundFxSource.play(/*frequency*/);
        });
    }
}

export function HERO_HITTING(action) {

}

export function EXTRA_THROW_2(action) {

}

export function EXTRA_THROW_3(action) {

}

export function EXTRA_AIMING_2(action) {

}

export function UNKNOWN_29(action) {
}

export function UNKNOWN_39(action) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play();
    });
}

export function NOP() {

}
