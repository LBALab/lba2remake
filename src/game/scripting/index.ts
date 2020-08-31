import {SUICIDE} from './life';
import DebugData from '../../ui/editor/DebugData';

export function runScript(params, script, time) {
    const instructions = script.instructions;
    const context = script.context;
    const state = context.state;

    if (!instructions)
        return;

    const activeDebug = params.editor && context.scene.isActive;
    const activeCommands : {
        section?: any;
    } = {};
    let breakpoints = {};
    if (activeDebug) {
        breakpoints = DebugData.breakpoints[context.type][context.actor.index] || {};
    }

    state.offset = state.reentryOffset;
    state.continue = state.offset !== -1 && !state.terminated && !state.stopped;

    while (state.continue) {
        if (state.offset >= instructions.length || isNaN(state.offset)) {
            // tslint:disable-next-line:no-console max-line-length
            console.warn(`Invalid offset: ${context.scene.index}:${context.actor.index}:${context.type}:${state.lastOffset + 1} offset=${state.offset}`);
            state.terminated = true;
            return;
        }
        state.lastOffset = state.offset;
        state.reentryOffset = -1;
        try {
            const offset = state.offset;
            const next = instructions[offset];
            if (activeDebug) {
                if (!('section' in activeCommands)) {
                    activeCommands.section = next.section;
                }
                activeCommands[offset] = true;
                if (offset in breakpoints) {
                    if (!context.game.isPaused()) {
                        const actor = context.actor;
                        DebugData.selection = {type: 'actor', index: actor.index};
                        context.game.pause();
                    }
                }
            }
            if (!(next.skipSideScenes && !script.context.scene.isActive)) {
                next(time);
            }
        } catch (e) {
            // tslint:disable-next-line:no-console max-line-length
            console.error(`Error on instruction: actor(${context.actor.index}):${context.type}:${instructions[state.offset].dbgLabel}"\n`, e);
        }
        if (state.continue) {
            state.offset += 1;
        }
    }
    if (activeDebug) {
        DebugData.script[context.type][context.actor.index] = activeCommands;
    }
}

export function killActor(actor) {
    actor.isVisible = false;
    SUICIDE.call(actor.scripts.life.context);
}

export function reviveActor(actor, game) {
    actor.isVisible = true;
    if (actor.threeObject) {
        if (actor.index === 0 && game.controlsState.firstPerson) {
            actor.threeObject.visible = false;
        } else {
            actor.threeObject.visible = true;
        }
    }
    actor.scripts.life.context.state.terminated = false;
    actor.scripts.life.context.state.reentryOffset = 0;
    actor.scripts.move.context.state.terminated = false;
    actor.scripts.move.context.state.reentryOffset = 0;
    actor.scripts.move.context.state.stopped = true;
    actor.scripts.move.context.state.trackIndex = -1;
    actor.isKilled = false;
    actor.props.runtimeFlags.isDead = false;
}
