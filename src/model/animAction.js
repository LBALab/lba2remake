import {each} from 'lodash';

import {AnimActionOpcode} from './data/index';
import {getRandom} from '../utils/lba';

export function processAnimAction(ctx) {
    const {entityAnim, animState} = ctx;
    const actions = entityAnim.actions;
    const animFrame = animState.currentFrame;
    each(actions, (action) => {
        if (action.animFrame === animFrame && animState.keyframeChanged) {
            const actionType = AnimActionOpcode[action.type];
            if (actionType !== undefined && actionType.callback !== undefined) {
                actionType.callback(action, ctx);
            }
        }
    });
}

export function NOP() {

}

export function BODY() {

}

export function BODP() {

}

export function ANIM() {

}

export function ANIP() {

}

export function HIT() {

}

export function SAMPLE(action, {game}) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play();
    });
}

export function SAMPLE_RND(action, {game}) {
    let frequency = getRandom(0, action.frequency) + 0x1000 - (action.frequency >> 1);
    if (frequency < 0 || frequency > 24000) {
        frequency = 0;
    }
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play(frequency);
    });
}

export function THROW() {

}

export function THROW_MAGIC() {

}

export function SAMPLE_REPEAT() {

}

export function THROW_SEARCH() {

}

export function THROW_ALPHA() {

}

export function SAMPLE_STOP() {

}

export function ZV() {

}

export function LEFT_STEP(action, {game, animState}) {
    let sampleIndex = animState.floorSound;
    if (sampleIndex !== undefined && sampleIndex !== -1) {
        sampleIndex += 30;
        // const frequency = getRandom(0, 0x1000) + 3596;
        const soundFxSource = game.getAudioManager().getSoundFxSource();
        soundFxSource.load(sampleIndex, () => {
            soundFxSource.play(/* frequency */);
        });
    }
}

export function RIGHT_STEP(action, {game, animState}) {
    let sampleIndex = animState.floorSound;
    if (sampleIndex !== undefined && sampleIndex !== -1) {
        sampleIndex += 30;
        // const frequency = getRandom(0, 0x1000) + 3596;
        const soundFxSource = game.getAudioManager().getSoundFxSource();
        soundFxSource.load(sampleIndex, () => {
            soundFxSource.play(/* frequency */);
        });
    }
}

export function HIT_HERO() {

}

export function THROW_3D() {

}

export function THROW_3D_ALPHA() {

}

export function THROW_3D_SEARCH() {

}

export function THROW_3D_MAGIC() {

}

export function SUPER_HIT() {

}

export function THROW_OBJ_3D() {

}

export function PATH() {

}

export function FLOW() {

}

export function FLOW_3D() {

}

export function THROW_DART() {

}

export function SHIELD() {

}

export function SAMPLE_MAGIC() {
}

export function THROW_3D_CONQUE() {

}

export function ZV_ANIMIT() {

}

export function IMPACT() {

}

export function RENVOIE() {

}

export function RENVOYABLE() {

}

export function TRANSPARENT() {

}

export function SCALE() {

}

export function LEFT_JUMP() {

}

export function RIGHT_JUMP() {

}

export function NEW_SAMPLE(action, {game}) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play();
    });
}

export function IMPACT_3D() {

}

export function THROW_MAGIC_EXTRA() {

}

export function THROW_FOUDRE() {

}
