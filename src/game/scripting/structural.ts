import { ScriptContext } from './ScriptContext';
import Actor from '../Actor';
/* Conditionals */

export function IF(this: ScriptContext, condition, operator, offset) {
    if (!operator(condition())) {
        OFFSET.call(this, offset);
    }
}

export function SNIF(this: ScriptContext) {
    // Should never be called -- original game internal use only
}

export function NEVERIF(this: ScriptContext) {
    // Should never be called -- original game internal use only
}

export function NOIF(this: ScriptContext) {
    // Should never be called -- original game internal use only
}

export function SWIF(this: ScriptContext, cmdState, condition, operator, offset) {
    const status = operator(condition());
    if (!(status && !cmdState.status)) {
        OFFSET.call(this, offset);
    }
    cmdState.status = status;
}

export function ONEIF(this: ScriptContext, cmdState, condition, operator, offset) {
    const status = operator(condition());
    if (!(status && !cmdState.used)) {
        OFFSET.call(this, offset);
    }
    if (status) {
        cmdState.used = true;
    }
}

export function OR_IF(this: ScriptContext, condition, operator, offset) {
    if (operator(condition())) {
        OFFSET.call(this, offset);
    }
}

export function AND_IF(this: ScriptContext, condition, operator, offset) {
    IF.call(this, condition, operator, offset);
}

export function ELSE(this: ScriptContext, offset) {
    OFFSET.call(this, offset);
}

export function ENDIF(this: ScriptContext) {
    // Nothing to do here
}

export function SWITCH(this: ScriptContext, condition) {
    this.state.switchValue = condition();
}

export function OR_CASE(this: ScriptContext, operator, offset) {
    if (operator(this.state.switchValue)) {
        OFFSET.call(this, offset);
    }
}

export function CASE(this: ScriptContext, operator, offset) {
    if (!operator(this.state.switchValue)) {
        OFFSET.call(this, offset);
    }
}

export function DEFAULT(this: ScriptContext) {
    // do nothing
}

export function BREAK(this: ScriptContext, offset) {
    OFFSET.call(this, offset);
}

export function END_SWITCH(this: ScriptContext) {
    delete this.state.switchValue;
}

/* Comportements */

export function BEHAVIOUR(this: ScriptContext) {
    this.state.comportementOffset = this.state.offset;
}

export function SET_BEHAVIOUR(this: ScriptContext, offset) {
    this.state.nextComportement = offset;
}

export function SET_BEHAVIOUR_OBJ(this: ScriptContext, actor, offset) {
    actor.scripts.life.context.state.reentryOffset = offset;
}

export function END_BEHAVIOUR(this: ScriptContext) {
    if (this.state.nextComportement != null) {
        this.state.reentryOffset = this.state.nextComportement;
        delete this.state.nextComportement;
    } else {
        this.state.reentryOffset = this.state.comportementOffset;
    }
    this.state.continue = false;
}

export function SAVE_BEHAVIOUR(this: ScriptContext) {
    this.state.savedOffset = this.state.comportementOffset;
}

export function RESTORE_BEHAVIOUR(this: ScriptContext) {
    if (this.state.savedOffset) {
        this.state.reentryOffset = this.state.savedOffset;
        this.state.continue = false;
    }
}

export function SAVE_BEHAVIOUR_OBJ(this: ScriptContext, actor: Actor) {
    const state = actor.scripts.life.context.state;
    state.savedOffset = state.comportementOffset;
}

export function RESTORE_BEHAVIOUR_OBJ(this: ScriptContext, actor: Actor) {
    const state = actor.scripts.life.context.state;
    if (state.savedOffset) {
        state.reentryOffset = state.savedOffset;
        state.continue = false;
    }
}

/* Tracks */

export function TRACK(this: ScriptContext, index) {
    this.state.trackIndex = index;
    this.state.trackOffset = this.state.offset;
}

export function SET_TRACK(this: ScriptContext, offset) {
    this.moveState.reentryOffset = offset;
    this.moveState.stopped = false;
}

export function SET_TRACK_OBJ(this: ScriptContext, actor, offset) {
    actor.scripts.move.context.state.reentryOffset = offset;
    actor.scripts.move.context.state.stopped = false;
}

export function SAVE_CURRENT_TRACK(this: ScriptContext) {
    this.moveState.savedOffset = this.moveState.trackOffset;
    this.moveState.stopped = true;
}

export function RESTORE_LAST_TRACK(this: ScriptContext) {
    if (this.moveState.savedOffset) {
        this.moveState.reentryOffset = this.moveState.savedOffset;
        this.moveState.stopped = false;
    }
}

export function SAVE_CURRENT_TRACK_OBJ(this: ScriptContext, actor: Actor) {
    const state = actor.scripts.move.context.state;
    state.savedOffset = state.trackOffset;
    state.stopped = true;
}

export function RESTORE_LAST_TRACK_OBJ(this: ScriptContext, actor: Actor) {
    const state = actor.scripts.move.context.state;
    if (state.savedOffset) {
        state.reentryOffset = state.savedOffset;
        state.stopped = false;
    }
}

/* Misc */

export function END(this: ScriptContext) {
    this.state.terminated = true;
    this.state.continue = false;
}

export function END_LIFE(this: ScriptContext) {
    END.call(this);
}

export function NOP(this: ScriptContext) {
    // DO NOTHING
}

export function RETURN(this: ScriptContext) {
    END_BEHAVIOUR.call(this);
}

export function OFFSET(this: ScriptContext, offset) {
    this.state.offset = offset - 1;
}

export function GOTO(this: ScriptContext, offset) {
    this.state.reentryOffset = offset;
    this.state.continue = false;
}

export function STOP(this: ScriptContext) {
    this.state.stopped = true;
    this.state.continue = false;
}
