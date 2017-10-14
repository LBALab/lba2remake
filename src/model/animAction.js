import {each} from 'lodash';

import {AnimActionOpcode} from './data/index';
import {getRandom} from '../utils/lba'

export function processAnimAction(game, entityAnim, animState) {
    const actions = entityAnim.actions;
    const animFrame = animState.currentFrame;
    each(actions, action => {
       if (action.animFrame === animFrame && animState.keyframeChanged) {
           const actionType = AnimActionOpcode[action.type];
           if (actionType !== undefined && actionType.callback !== undefined) {
               actionType.callback(game, action, animState);
           }
       }
    });
}

export function NOP() {

}

export function BODY(game, action) {

}

export function BODP(game, action) {

}

export function ANIM(game, action) {

}

export function ANIP(game, action) {

}

export function HIT(game, action) {

}

export function SAMPLE(game, action) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play();
    });
}

export function SAMPLE_RND(game, action) {
    let frequency = getRandom(0, action.frequency) + 0x1000 - (action.frequency >> 1);
    if (frequency < 0 || frequency > 24000) {
        frequency = 0;
    }
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play(frequency);
    });
}

export function THROW(game, action) {

}

export function THROW_MAGIC(game, action) {

}

export function SAMPLE_REPEAT(game, action) {

}

export function THROW_SEARCH(game, action) {

}

export function THROW_ALPHA(game, action) {

}

export function SAMPLE_STOP(game, action) {

}

export function ZV(game, action) {

}

export function LEFT_STEP(game, action, animState) {
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

export function RIGHT_STEP(game, action, animState) {
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

export function HIT_HERO(game, action) {

}

export function THROW_3D(game, action) {

}

export function THROW_3D_ALPHA(game, action) {

}

export function THROW_3D_SEARCH(game, action) {

}

export function THROW_3D_MAGIC(game, action) {

}

export function SUPER_HIT(game, action) {

}

export function THROW_OBJ_3D(game, action) {

}

export function PATH(game, action) {

}

export function FLOW(game, action) {

}

export function FLOW_3D(game, action) {

}

export function THROW_DART(game, action) {

}

export function SHIELD(game, action) {

}

export function SAMPLE_MAGIC(game, action) {
}

export function THROW_3D_CONQUE(game, action) {

}

export function ZV_ANIMIT(game, action) {

}

export function IMPACT(game, action) {

}

export function RENVOIE(game, action) {

}

export function RENVOYABLE(game, action) {

}

export function TRANSPARENT(game, action) {

}

export function SCALE(game, action) {

}

export function LEFT_JUMP(game, action) {

}

export function RIGHT_JUMP(action) {

}

export function NEW_SAMPLE(game, action) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play();
    });
}

export function IMPACT_3D(game, action) {

}

export function THROW_MAGIC_EXTRA(game, action) {

}

export function THROW_FOUDRE(game, action) {

}
