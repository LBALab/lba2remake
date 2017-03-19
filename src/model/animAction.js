import {each} from 'lodash';

import {AnimActionOpcode} from './data/index';

export function processAnimAction(entityAnim, animState) {
    const actions = entityAnim.actions;
    const animFrame = animState.currentFrame;
    each(actions, action => {
       if (action.animFrame == animFrame) {
           const actionType = AnimActionOpcode[action.type]
           if (actionType != null && actionType.callback != null) {
               actionType.callback(action);
           }
       }
    });
}

export function HITTING(action) {

}

export function SAMPLE(action) {

}

export function SAMPLE_FREQ(action) {

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

export function SAMPLE_BRICK_1(action) {

}

export function SAMPLE_BRICK_2(action) {

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

}

export function NOP() {

}
