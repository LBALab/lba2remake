import {SUICIDE} from './life';
import DebugData from '../../ui/editor/DebugData';
import { mapDataName } from '../../ui/editor/areas/gameplay/scripts/listing';

export function runScript(params, script, time) {
    const instructions = script.instructions;
    const commands = script.commands;
    const context = script.context;
    const state = context.state;

    if (!instructions)
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
                            realValue: condValue,
                            idx
                        });
                }
                activeCommands[offset] = activeCommand;
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
