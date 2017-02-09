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
    state.continue = state.offset != -1;

    if (state.offset >= 0) {
        while (state.continue) {
            if (state.offset >= instructions.length) {
                console.warn(`Reached end of script ${script.context.actor.index}:${script.context.type}`);
                state.reentryOffset = -1;
                break;
            }
            setCursorPosition(context.scene, context.actor, context.type, state.offset);
            state.lastOffset = state.offset;
            instructions[state.offset](time);
            if (state.continue) {
                state.offset++;
            }
        }
    }
}
