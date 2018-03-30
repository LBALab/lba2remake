import {each, isEmpty} from 'lodash';
import {parseScript} from './parser';
import {compileScripts} from './compiler';
import {SUICIDE} from './process/life';
import DebugData from '../ui/editor/DebugData';
import {mapDataName} from '../ui/editor/areas/ScriptEditorArea/listing';

export function loadScripts(params, game, scene) {
    each(scene.actors, (actor) => {
        actor.scripts = {
            life: parseScript(actor.index, 'life', actor.props.lifeScript),
            move: parseScript(actor.index, 'move', actor.props.moveScript)
        };
    });
    each(scene.actors, (actor) => {
        compileScripts(game, scene, actor);
        actor.runScripts = (time) => {
            runScript(params, actor.scripts.life, time);
            runScript(params, actor.scripts.move, time);
        };
    });
}

function runScript(params, script, time) {
    const instructions = script.instructions;
    const commands = script.commands;
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
            // eslint-disable-next-line no-console
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
                const activeCommand = {};
                if (next.condition) {
                    const condValue = next.condition();
                    const cmdCond = commands[offset].condition;
                    const operandType = cmdCond.operandType;
                    const idx = cmdCond.param ? cmdCond.param.value : undefined;
                    activeCommand.condValue = mapDataName(
                        context.scene, {
                            type: operandType,
                            value: condValue,
                            idx
                        });
                }
                activeCommands[offset] = activeCommand;
                if (offset in breakpoints) {
                    if (!context.game.isPaused()) {
                        DebugData.selection.actor = context.actor.index;
                        context.game.pause();
                    }
                }
            }
            if (!(next.skipSideScenes && !script.context.scene.isActive)) {
                next(time);
            }
        } catch (e) {
            // eslint-disable-next-line no-console
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
