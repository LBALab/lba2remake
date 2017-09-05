import {each} from 'lodash';

import {AnimActionOpcode} from './data/index';
import {getRandom} from '../utils/lba'

export function processAnimAction(entityAnim, animState) {
    const actions = entityAnim.actions;
    const animFrame = animState.currentFrame;
    each(actions, action => {
       if (action.animFrame == animFrame && animState.keyframeChanged) {
           const actionType = AnimActionOpcode[action.type];
           if (actionType != null && actionType.callback != null) {
               actionType.callback(action, animState);
           }
       }
    });
}

export function NOP() {

}

export function BODY(action) {

}

export function BODP(action) {

}

export function ANIM(action) {

}

export function ANIP(action) {

}

export function HIT(action) {

}

export function SAMPLE(action) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play();
    });
}

export function SAMPLE_RND(action) {
    let frequency = getRandom(0, action.frequency) + 0x1000 - (action.frequency >> 1);
    if (frequency < 0 || frequency > 24000) {
        frequency = 0;
    }
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play(frequency);
    });
}

export function THROW(action) {

}

export function THROW_MAGIC(action) {

}

export function SAMPLE_REPEAT(action) {

}

export function THROW_SEARCH(action) {

}

export function THROW_ALPHA(action) {

}

export function SAMPLE_STOP(action) {

}

export function ZV(action) {

}

export function LEFT_STEP(action, animState) {
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

export function RIGHT_STEP(action, animState) {
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

export function HIT_HERO(action) {

}

export function THROW_3D(action) {

}

export function THROW_3D_ALPHA(action) {

}

export function THROW_3D_SEARCH(action) {

}

export function THROW_3D_MAGIC(action) {

}

export function SUPER_HIT(action) {

}

export function THROW_OBJ_3D(action) {

}

export function PATH(action) {

}

export function FLOW(action) {

}

export function FLOW_3D(action) {

}

export function THROW_DART(action) {

}

export function SHIELD(action) {

}

export function SAMPLE_MAGIC(action) {
}

export function THROW_3D_CONQUE(action) {

}

export function ZV_ANIMIT(action) {

}

export function IMPACT(action) {

}

export function RENVOIE(action) {

}

export function RENVOYABLE(action) {

}

export function TRANSPARENT(action) {

}

export function SCALE(action) {

}

export function LEFT_JUMP(action) {

}

export function RIGHT_JUMP(action) {

}

export function NEW_SAMPLE(action) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play();
    });
}

export function IMPACT_3D(action) {

}

export function THROW_MAGIC_EXTRA(action) {

}

export function THROW_FOUDRE(action) {

}
