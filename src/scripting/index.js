import {each, isEmpty} from 'lodash';
import {parseScript} from './parser';
import {compileScripts} from './compiler';
import {SUICIDE} from './process/life';
import DebugData from '../ui/editor/DebugData';

export function loadScripts(params, game, scene) {
    each(scene.actors, actor => {
        actor.scripts = {
            life: parseScript(actor.index, 'life', actor.props.lifeScript),
            move: parseScript(actor.index, 'move', actor.props.moveScript)
        };
    });
    each(scene.actors, actor => {
        compileScripts(game, scene, actor);
        actor.runScripts = (time) => {
            runScript(params, actor.scripts.life, time);
            runScript(params, actor.scripts.move, time);
        };
    });
}

function runScript(params, script, time) {
    const instructions = script.instructions;
    const context = script.context;
    const state = context.state;

    if (isEmpty(instructions))
        return;

    const activeDebug = params.editor && context.scene.isActive;
    const activeCommands = {};
    let breakpoints = {};
    if (activeDebug) {
        breakpoints = DebugData.breakpoints[context.type][context.actor.index] || {};
    }

    state.offset = state.reentryOffset;
    state.continue = state.offset !== -1 && !state.terminated && !state.stopped;

    while (state.continue) {
        if (state.offset >= instructions.length || isNaN(state.offset)) {
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
                const activeCommand = {};
                if (next.condition) {
                    activeCommand.condValue = next.condition();
                }
                activeCommands[offset] = activeCommand;
                if (offset in breakpoints) {
                    if (!context.game.isPaused()) {
                        DebugData.selection.actor = context.actor.index;
                        context.game.pause();
                    }
                }
            }
            next(time);
        }
        catch (e) {
            console.error('Error on instruction: actor(' + context.actor.index + '):' + context.type + ':' + instructions[state.offset].dbgLabel + '"\n', e);
        }
        if (state.continue) {
            state.offset++;
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
