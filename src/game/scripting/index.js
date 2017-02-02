import {LifeOpcode} from './data/life';
import {MoveOpcode} from './data/move';
import * as DEBUG from './debug';

export function initScriptState() {
    return {
        life: {
            sceneIndex: 0,
            offset: 0,
            reentryOffset: 0,
            continue: true,
            opcodeOffset: 0,
            switchCondition: null,
            switchValue1: 0,
            switchConditionTest: false,
            debug: null
        },
        move: {
            sceneIndex: 0,
            offset: 0,
            reentryOffset: 0,
            savedOffset: 0,
            labelIndex: 0,
            labelOffset: 0,
            continue: true,
            elapsedTime: 0,
            waitTime: 0,
            isWaiting: false,
            debug: null
        }
    };
}

export function processLifeScript(game, actor, time) {
    const state = actor.scriptState;
    const script = actor.props.lifeScript;
    state.life.sceneIndex = actor.props.sceneIndex;
    state.life.offset = state.life.reentryOffset;
    state.life.continue = state.life.offset != -1;
    state.life.debug = DEBUG.initDebug();
    if (script.byteLength > 0 && state.life.offset >= 0) {
        while (state.life.continue) {
            if (state.life.offset >= script.byteLength) {
                console.warn("LifeScript error: offset > length");
                state.life.offset = -1;
                break;
            }
            state.life.opcodeOffset = state.life.offset;
            const opcode = script.getUint8(state.life.offset++, true);
            DEBUG.setLife(state.life.debug, LifeOpcode[opcode].command);
            LifeOpcode[opcode].callback(game, script, state, actor);
            if (state.life.continue) {
                state.life.offset += LifeOpcode[opcode].offset;
            }
            //if (actor.index == 22)
            DEBUG.displayLife(state.life.debug);
        }
    }
}

export function processMoveScript(game, actor, time) {
    const state = actor.scriptState;
    const script = actor.props.moveScript;
    state.move.sceneIndex = actor.props.sceneIndex;
    state.move.offset = state.move.reentryOffset;
    state.move.continue = state.move.offset != -1;
    state.move.elapsedTime = time.elapsed * 1000;
    state.move.debug = DEBUG.initDebug();
    if (script.byteLength > 0 && state.move.offset >= 0) {
        while (state.move.continue) {
            if (state.move.offset >= script.byteLength) {
                console.warn("MoveScript error: offset > length");
                state.move.offset = -1;
                break;
            }
            const opcode = script.getUint8(state.move.offset++, true);
            DEBUG.setMove(state.move.debug, MoveOpcode[opcode].command);
            MoveOpcode[opcode].callback(game, script, state.move, actor);
            if (state.move.continue) {
                state.move.offset += MoveOpcode[opcode].offset;
            }
            //if (actor.index == 22)
            DEBUG.displayMove(state.move.debug);
        }
    }
}
