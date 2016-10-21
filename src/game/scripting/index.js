import async from 'async';
import _ from 'lodash';

import {LifeOpcode} from './data/life';
import {MoveOpcode} from './data/move';
import * as DEBUG from './debug';

export function initScriptState() {
    return {
        life: { 
            offset: 0,
            continue: true,
            opcodeOffset: 0,
            switchCondition: null,
            switchValue1: 0,
            debug: null
        },
        move: {
            offset: 0,
            continue: true,
            elapsedTime: 0,
            waitTime: 0,
            isWaiting: false,
            debug: null
        }
    };
}

export function processLifeScript(actor) {
    const state = actor.scriptState;
    const script = actor.props.lifeScript;
    state.continue = true;
    state.life.debug = DEBUG.initDebug();
    if (script.byteLength > 0 && state.life.offset >= 0) {
        while (state.life.continue) {
            if (state.life.offset >= script.byteLength) {
                console.warn("LifeScript error: offset > length");
                state.life.offset = -1;
                break;
            }
            state.life.opcodeOffset = state.life.offset++;
            const opcode = script.getUint8(state.life.opcodeOffset, true);
            DEBUG.setLife(state.life.debug, LifeOpcode[opcode].command);
            LifeOpcode[opcode].callback(script, state.life, actor);
            state.life.offset += LifeOpcode[opcode].offset;
            DEBUG.displayLife(state.life.debug);
        }
    }
}

export function processMoveScript(actor) {
    const state = actor.scriptState;
    const script = actor.props.moveScript;
    state.continue = true;
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
            MoveOpcode[opcode].callback(script, state.move, actor);
            state.move.offset += MoveOpcode[opcode].offset;
            DEBUG.displayMove(state.move.debug);
        }
    }
}
