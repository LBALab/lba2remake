import {each, isEmpty} from 'lodash';
import {parseScript} from './parser';
import {compileScripts} from './compiler';
import {setCursorPosition, isPaused} from './debug';
import {SUICIDE} from './process/life';

export function loadScripts(game, scene) {
    each(scene.actors, actor => {
        actor.scripts = {
            life: parseScript(actor.index, 'life', actor.props.lifeScript),
            move: parseScript(actor.index, 'move', actor.props.moveScript)
        };
    });
    each(scene.actors, actor => {
        compileScripts(game, scene, actor);
        actor.runScripts = (time, step) => {
            runScript(actor.scripts.life, time, step);
            runScript(actor.scripts.move, time, step);
        };
    });
}

function runScript(script, time, step) {
    const instructions = script.instructions;
    const context = script.context;
    const state = context.state;
    const paused = isPaused();

    if (isEmpty(instructions))
        return;

    state.offset = state.reentryOffset;
    state.continue = state.offset != -1 && !state.terminated && !state.stopped;

    while (state.continue && (!paused || (paused && step))) {
        if (state.offset >= instructions.length || isNaN(state.offset)) {
            console.warn(`Invalid offset: ${context.scene.index}:${context.actor.index}:${context.type}:${state.lastOffset + 1} offset=${state.offset}`);
            state.terminated = true;
            return;
        }
        setCursorPosition(context.scene, context.actor, context.type, state.offset);
        state.lastOffset = state.offset;
        state.reentryOffset = -1;
        instructions[state.offset](time);
        if (state.continue) {
            state.offset++;
        }
        if (paused && step) {
            if (state.reentryOffset == -1) {
                state.reentryOffset = state.offset;
            }
            const next = instructions[state.reentryOffset];
            let condValue = null;
            if (next && next.condition) {
                condValue = next.condition();
            }
            setCursorPosition(context.scene, context.actor, context.type, state.reentryOffset, true, condValue);
            break;
        }
    }
}

export function killActor(actor) {
    actor.isVisible = false;
    SUICIDE.call(actor.scripts.life.context);
}

export function reviveActor(actor) {
    actor.isVisible = true;
    if (actor.threeObject) {
        actor.threeObject.visible = true;
    }
    actor.scripts.life.context.state.terminated = false;
    actor.scripts.life.context.state.reentryOffset = 0;
    actor.scripts.move.context.state.terminated = false;
    actor.scripts.move.context.state.reentryOffset = 0;
    actor.scripts.move.context.state.stopped = true;
    actor.scripts.move.context.state.trackIndex = -1;
    actor.isKilled = false;
}