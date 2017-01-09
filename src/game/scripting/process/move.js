
export function END(game, script, state, actor) {
    state.continue = false;
    state.reentryOffset = -1;
}

export function NOP(game, script, state, actor) {
    
}

export function BODY(game, script, state, actor) {
    actor.props.bodyIndex = script.getUint8(state.offset, true);
}

export function ANIM(game, script, state, actor) {
    actor.props.animIndex = script.getUint8(state.offset, true);
}

export function GOTO_POINT(game, script, state, actor) {
    
}

export function WAIT_ANIM(game, script, state, actor) {
    if (actor.animState.hasEnded) {
        // TODO clear angle
        //state.continue = false;
        return;
    }
    state.reentryOffset = state.offset - 1;
    state.continue = false;
}

export function ANGLE(game, script, state, actor) {
    
}

export function POS_POINT(game, script, state, actor) {
    
}

export function LABEL(game, script, state, actor) {
    state.labelIndex = script.getUint8(state.offset, true);
    state.labelOffset = state.offset - 2;
}

export function GOTO(game, script, state, actor) {
    state.reentryOffset = script.getInt16(state.offset, true);
}

export function STOP(game, script, state, actor) {
    state.continue = false;
    state.reentryOffset = -1;
}

export function GOTO_SYM_POINT(game, script, state, actor) {
    
}

export function WAIT_NUM_ANIM(game, script, state, actor) {
    if (actor.animState.hasEnded) {
        const totalRepeats = script.getUint8(state.offset, true);
        let numRepeats = script.getUint8(state.offset + 1, true);
        numRepeats++;
        if (numRepeats == totalRepeats) {
            numRepeats = 0;
        } else {
            state.continue = false;
        }
        script.setUint8(state.offset + 1, numRepeats);
    } else {
        state.continue = false;
    }

    if (!state.continue) {
        state.reentryOffset = state.offset - 1;
    }
}

export function SAMPLE(game, script, state, actor) {
    
}

export function GOTO_POINT_3D(game, script, state, actor) {
    
}

export function SPEED(game, script, state, actor) {
    
}

export function BACKGROUND(game, script, state, actor) {
    
}

export function WAIT_NUM_SECOND(game, script, state, actor) {
    const numSeconds = script.getUint8(state.offset, true);
    if (state.waitTime == 0) {
        state.waitTime = state.elapsedTime + (numSeconds * 1000);
    }
    if (state.elapsedTime < state.waitTime) {
        state.continue = false;
        state.reentryOffset = state.offset - 1;
    } else {
        state.waitTime = 0;
    }
}

export function NO_BODY(game, script, state, actor) {
    actor.visible = false;
}

export function BETA(game, script, state, actor) {
    
}

export function OPEN_LEFT(game, script, state, actor) {
    
}

export function OPEN_RIGHT(game, script, state, actor) {
    
}

export function OPEN_UP(game, script, state, actor) {
    
}

export function OPEN_DOWN(game, script, state, actor) {
    
}

export function CLOSE(game, script, state, actor) {
    
}

export function WAIT_DOOR(game, script, state, actor) {
    
}

export function SAMPLE_RND(game, script, state, actor) {
    
}

export function SAMPLE_ALWAYS(game, script, state, actor) {
    
}

export function SAMPLE_STOP(game, script, state, actor) {
    
}

export function PLAY_ACF(game, script, state, actor) {
    
}

export function REPEAT_SAMPLE(game, script, state, actor) {
    
}

export function SIMPLE_SAMPLE(game, script, state, actor) {
    
}

export function FACE_HERO(game, script, state, actor) {
    
}

export function ANGLE_RND(game, script, state, actor) {
    
}

export function REPLACE(game, script, state, actor) {
    
}

export function WAIT_NUM_DECIMAL(game, script, state, actor) {
    
}

export function SPRITE(game, script, state, actor) {
    
}

export function WAIT_NUM_SECOND_RND(game, script, state, actor) {
    
}

export function SET_FRAME(game, script, state, actor) {
    
}

export function SET_FRAME_3DS(game, script, state, actor) {
    
}

export function SET_START_3DS(game, script, state, actor) {
    
}

export function SET_END_3DS(game, script, state, actor) {
    
}

export function START_ANIM_3DS(game, script, state, actor) {
    
}

export function STOP_ANIM_3DS(game, script, state, actor) {
    
}

export function WAIT_ANIM_3DS(game, script, state, actor) {
    
}

export function WAIT_FRAME_3DS(game, script, state, actor) {
    
}

export function WAIT_NUM_DECIMAL_RND(game, script, state, actor) {
    
}

export function INTERVAL(game, script, state, actor) {
    
}

export function FREQUENCY(game, script, state, actor) {
    
}

export function VOLUME(game, script, state, actor) {
    
}
