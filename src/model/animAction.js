import {each} from 'lodash';

import {AnimActionOpcode} from './data/index';
import {getRandom} from '../utils/lba'

export function processAnimAction(ctx) {
    const {entityAnim, animState} = ctx;
    const actions = entityAnim.actions;
    const animFrame = animState.currentFrame;
    each(actions, action => {
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

export function BODY(action, ctx) {

}

export function BODP(action, ctx) {

}

export function ANIM(action, ctx) {

}

export function ANIP(action, ctx) {

}

export function HIT(action, ctx) {

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

export function THROW(action, ctx) {

}

export function THROW_MAGIC(action, ctx) {

}

export function SAMPLE_REPEAT(action, ctx) {

}

export function THROW_SEARCH(action, ctx) {

}

export function THROW_ALPHA(action, ctx) {

}

export function SAMPLE_STOP(action, ctx) {

}

export function ZV(action, {model}) {
    console.log('ZV', action);
}

export function LEFT_STEP(action, {game, animState}) {
    let sampleIndex = animState.floorSound;
    if (sampleIndex !== undefined && sampleIndex !== -1) {
        sampleIndex += 30;
        //const frequency = getRandom(0, 0x1000) + 3596;
        const soundFxSource = game.getAudioManager().getSoundFxSource();
        soundFxSource.load(sampleIndex, () => {
            soundFxSource.play(/*frequency*/);
        });
    }
}

export function RIGHT_STEP(action, {game, animState}) {
    let sampleIndex = animState.floorSound;
    if (sampleIndex !== undefined && sampleIndex !== -1) {
        sampleIndex += 30;
        //const frequency = getRandom(0, 0x1000) + 3596;
        const soundFxSource = game.getAudioManager().getSoundFxSource();
        soundFxSource.load(sampleIndex, () => {
            soundFxSource.play(/*frequency*/);
        });
    }
}

export function HIT_HERO(action, ctx) {

}

export function THROW_3D(action, ctx) {

}

export function THROW_3D_ALPHA(action, ctx) {

}

export function THROW_3D_SEARCH(action, ctx) {

}

export function THROW_3D_MAGIC(action, ctx) {

}

export function SUPER_HIT(action, ctx) {

}

export function THROW_OBJ_3D(action, ctx) {

}

export function PATH(action, ctx) {

}

export function FLOW(action, ctx) {

}

export function FLOW_3D(action, ctx) {

}

export function THROW_DART(action, ctx) {

}

export function SHIELD(action, ctx) {

}

export function SAMPLE_MAGIC(action, ctx) {
}

export function THROW_3D_CONQUE(action, ctx) {

}

export function ZV_ANIMIT(action, ctx) {
    console.log('ZV_ANIMIT', action);
}

export function IMPACT(action, ctx) {

}

export function RENVOIE(action, ctx) {

}

export function RENVOYABLE(action, ctx) {

}

export function TRANSPARENT(action, ctx) {

}

export function SCALE(action, ctx) {

}

export function LEFT_JUMP(action, ctx) {

}

export function RIGHT_JUMP({action}) {

}

export function NEW_SAMPLE(action, {game}) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play();
    });
}

export function IMPACT_3D(action, ctx) {

}

export function THROW_MAGIC_EXTRA(action, ctx) {

}

export function THROW_FOUDRE(action, ctx) {

}
