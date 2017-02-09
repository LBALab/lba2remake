import {each, isEmpty} from 'lodash';
import {parseScript} from './parser';
import {compileScripts} from './compiler';
import {setCursorPosition} from './debug';

export function loadScripts(game, scene) {
    each(scene.actors, actor => {
        actor.scripts = {
            life: parseScript(actor.index, 'life', actor.props.lifeScript),
            move: parseScript(actor.index, 'move', actor.props.moveScript)
        };
    });
    each(scene.actors, actor => {
        compileScripts(game, scene, actor);
        actor.runScripts = (time) => {
            runScript(actor.scripts.life, time);
            runScript(actor.scripts.move, time);
        };
    });
}

function runScript(script, time) {
    const instructions = script.instructions;
    const context = script.context;
    const state = context.state;

    if (isEmpty(instructions))
        return;

    state.offset = state.reentryOffset;
    state.continue = state.offset != -1 && !state.terminated;

    while (state.continue) {
        if (state.offset >= instructions.length || isNaN(state.offset)) {
            console.warn(`Invalid offset: ${context.scene.index}:${context.actor.index}:${context.type} offset=${state.offset} lastOffset=${state.lastOffset}`);
            state.reentryOffset = -1;
            state.terminated = true;
            return;
        }
        setCursorPosition(context.scene, context.actor, context.type, state.offset);
        state.lastOffset = state.offset;
        instructions[state.offset](time);
        if (state.continue) {
            state.offset++;
        }
    }
}
