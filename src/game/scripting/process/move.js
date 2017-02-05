//import THREE from 'three';
//import {getRotation} from '../../../utils/lba';

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
    //if (actor.index == 22)
    //    console.log(`22 animIndex: ${actor.props.animIndex}`);
    actor.props.animIndex = script.getUint8(state.offset, true);
    actor.resetAnimState();
    //if (actor.index == 22)
    //    console.log(`22 animIndex: ${actor.props.animIndex}`);
}

export function GOTO_POINT(game, script, state, actor) {
    const pointIndex = script.getUint8(state.offset, true);
    const point = game.getSceneManager().getScene(state.sceneIndex).getPoint(pointIndex);
    const distance = actor.goto(point.physics.position);
    //if (actor.index == 22)
    //  console.log(`${pointIndex}:${point.physics.position.x},${point.physics.position.z}:${actor.physics.position.x},${actor.physics.position.z}:${distance}`);

    if (distance < (500 / 1024)) {
        state.continue = false;
        state.reentryOffset = state.offset - 1;
    }
}

export function WAIT_ANIM(game, script, state, actor) {
    if (actor.animState.hasEnded) {
        actor.props.angle = 0;
        state.continue = false;
        state.reentryOffset = state.offset; // this is an exception to move to next comand but still quit the execution now with continue = false
        return;
    }
    state.reentryOffset = state.offset - 1;
    state.continue = false;
}

export function ANGLE(game, script, state, actor) {
    actor.setAngle(script.getInt16(state.offset, true));
}

export function POS_POINT(game, script, state, actor) {
    
}

export function TRACK(game, script, state, actor) {
    state.trackIndex = script.getUint8(state.offset, true);
    state.trackOffset = state.offset - 2;
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

export function WAIT_NUM_DSEC(game, script, state, actor) {
    const numSeconds = script.getUint8(state.offset, true);
    if (state.waitTime == 0) {
        state.waitTime = state.elapsedTime + (numSeconds * 100);
    }
    if (state.elapsedTime < state.waitTime) {
        state.continue = false;
        state.reentryOffset = state.offset - 1;
    } else {
        state.waitTime = 0;
    }
}

export function SPRITE(game, script, state, actor) {
    
}

export function WAIT_NUM_SECOND_RND(game, script, state, actor) {
    // TODO random seconds
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
    // TODO random seconds
    const numSeconds = script.getUint8(state.offset, true);
    if (state.waitTime == 0) {
        state.waitTime = state.elapsedTime + (numSeconds * 100);
    }
    if (state.elapsedTime < state.waitTime) {
        state.continue = false;
        state.reentryOffset = state.offset - 1;
    } else {
        state.waitTime = 0;
    }
}

export function INTERVAL(game, script, state, actor) {
    
}

export function FREQUENCY(game, script, state, actor) {
    
}

export function VOLUME(game, script, state, actor) {
    
}
