
export function END(script, state, actor) {
    state.continue = false;
}

export function NOP(script, state, actor) {
    
}

export function BODY(script, state, actor) {
    actor.props.bodyIndex = script.getUint8(state.offset, true);
}

export function ANIM(script, state, actor) {
    actor.props.animIndex = script.getUint8(state.offset, true);
}

export function GOTO_POINT(script, state, actor) {
    
}

export function WAIT_ANIM(script, state, actor) {
    if (actor.animState.hasEnded) {
        // TODO clear angle
        state.continue = false;
        return;
    }
    state.offset--;
    state.continue = false;
}

export function ANGLE(script, state, actor) {
    
}

export function POS_POINT(script, state, actor) {
    
}

export function LABEL(script, state, actor) {
    
}

export function GOTO(script, state, actor) {
    //state.offset = script.getInt16(state.offset, true);
}

export function STOP(script, state, actor) {
    state.continue = false;
    state.offset = -1;
}

export function GOTO_SYM_POINT(script, state, actor) {
    
}

export function WAIT_NUM_ANIM(script, state, actor) {
    
}

export function SAMPLE(script, state, actor) {
    
}

export function GOTO_POINT_3D(script, state, actor) {
    
}

export function SPEED(script, state, actor) {
    
}

export function BACKGROUND(script, state, actor) {
    
}

export function WAIT_NUM_SECOND(script, state, actor) {
    
}

export function NO_BODY(script, state, actor) {
    actor.visible = false;
}

export function BETA(script, state, actor) {
    
}

export function OPEN_LEFT(script, state, actor) {
    
}

export function OPEN_RIGHT(script, state, actor) {
    
}

export function OPEN_UP(script, state, actor) {
    
}

export function OPEN_DOWN(script, state, actor) {
    
}

export function CLOSE(script, state, actor) {
    
}

export function WAIT_DOOR(script, state, actor) {
    
}

export function SAMPLE_RND(script, state, actor) {
    
}

export function SAMPLE_ALWAYS(script, state, actor) {
    
}

export function SAMPLE_STOP(script, state, actor) {
    
}

export function PLAY_ACF(script, state, actor) {
    
}

export function REPEAT_SAMPLE(script, state, actor) {
    
}

export function SIMPLE_SAMPLE(script, state, actor) {
    
}

export function FACE_HERO(script, state, actor) {
    
}

export function ANGLE_RND(script, state, actor) {
    
}

export function REPLACE(script, state, actor) {
    
}

export function WAIT_NUM_DECIMAL(script, state, actor) {
    
}

export function SPRITE(script, state, actor) {
    
}

export function WAIT_NUM_SECOND_RND(script, state, actor) {
    
}

export function SET_FRAME(script, state, actor) {
    
}

export function SET_FRAME_3DS(script, state, actor) {
    
}

export function SET_START_3DS(script, state, actor) {
    
}

export function SET_END_3DS(script, state, actor) {
    
}

export function START_ANIM_3DS(script, state, actor) {
    
}

export function STOP_ANIM_3DS(script, state, actor) {
    
}

export function WAIT_ANIM_3DS(script, state, actor) {
    
}

export function WAIT_FRAME_3DS(script, state, actor) {
    
}

export function WAIT_NUM_DECIMAL_RND(script, state, actor) {
    
}

export function INTERVAL(script, state, actor) {
    
}

export function FREQUENCY(script, state, actor) {
    
}

export function VOLUME(script, state, actor) {
    
}
