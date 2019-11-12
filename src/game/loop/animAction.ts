// tslint:disable:function-name
import { each } from 'lodash';

import { AnimActionOpcode } from '../data/animAction';
import { getRandom } from '../../utils/lba';
import { unimplemented } from '../scripting/utils';

export function processAnimAction(ctx) {
    const {entityAnim, animState} = ctx;
    const actions = entityAnim.actions;
    const animFrame = animState.currentFrame;
    each(actions, (action) => {
        if (action.animFrame === animFrame && animState.keyframeChanged) {
            const actionType = AnimActionOpcode[action.type];
            if (actionType !== undefined && actionType.handler !== undefined) {
                actionType.handler(action, ctx);
            }
        }
    });
}

export const NOP = unimplemented();

export const BODY = unimplemented();

export const BODP = unimplemented();

export const ANIM = unimplemented();

export const ANIP = unimplemented();

export const HIT = unimplemented();

export function SAMPLE(action, {game}) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play();
    });
}

export function SAMPLE_RND(action, {game}) {
    let frequency = (getRandom(0, action.frequency) + 0x1000) - (action.frequency >> 1);
    if (frequency < 0 || frequency > 24000) {
        frequency = 0;
    }
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play(frequency);
    });
}

export const THROW = unimplemented();

export const THROW_MAGIC = unimplemented();

export const SAMPLE_REPEAT = unimplemented();

export const THROW_SEARCH = unimplemented();

export const THROW_ALPHA = unimplemented();

export const SAMPLE_STOP = unimplemented();

export const ZV = unimplemented();

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

export const HIT_HERO = unimplemented();

export function THROW_3D() {

}

export function THROW_3D_ALPHA() {

}

export function THROW_3D_SEARCH() {

}

export function THROW_3D_MAGIC() {

}

export const SUPER_HIT = unimplemented();

export function THROW_OBJ_3D() {

}

export const PATH = unimplemented();

export const FLOW = unimplemented();

export function FLOW_3D() {

}

export const THROW_DART = unimplemented();

export const SHIELD = unimplemented();

export const SAMPLE_MAGIC = unimplemented();

export function THROW_3D_CONQUE() {

}

export const ZV_ANIMIT = unimplemented();

export const IMPACT = unimplemented();

export const RENVOIE = unimplemented();

export const RENVOYABLE = unimplemented();

export const TRANSPARENT = unimplemented();

export const SCALE = unimplemented();

export const LEFT_JUMP = unimplemented();

export const RIGHT_JUMP = unimplemented();

export function NEW_SAMPLE(action, {game}) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.load(action.sampleIndex, () => {
        soundFxSource.play();
    });
}

export function IMPACT_3D() {

}

export const THROW_MAGIC_EXTRA = unimplemented();

export const THROW_FOUDRE = unimplemented();
