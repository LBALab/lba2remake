import async from 'async';
import _ from 'lodash';

import {MoveOpcode} from './moveScript';
import {LifeOpcode} from './lifeScript';

export function initScriptState() {
    return {
        life: { 
            offset: 0,
            continue: true,
            opcodeOffset: 0,
            switchCondition: null,
            switchValue1: 0
        },
        move: {
            offset: 0,
            continue: true,
            elapsedTime: 0,
            waitTime: 0,
            isWaiting: false
        }
    };
}

export function processLifeScript(actor) {
    const state = actor.scriptState;
    const script = actor.props.lifeScript;
    state.continue = true;
    if (script.byteLength > 0 && state.life.offset >= 0) {
        while (state.life.continue) {
            if (state.life.offset >= script.byteLength) {
                console.warn("MoveScript error: offset > length");
                state.life.offset = -1;
                break;
            }
            state.opcodeOffset = state.life.offset++;
            const opcode = script.getUint8(state.opcodeOffset, true);
            /*console.debug("opcode: " + opcode);
            console.debug("state: ", state.life);
            console.debug("opcode def: ", LifeOpcode[opcode]);
            console.debug(LifeOpcode[opcode].command);*/
            LifeOpcode[opcode].callback(script, state.life, actor);
            state.life.offset += LifeOpcode[opcode].offset;
        }
    }
}

export function processMoveScript(actor) {
    const state = actor.scriptState;
    const script = actor.props.moveScript;
    state.continue = true;
    if (script.byteLength > 0 && state.move.offset >= 0) {
        while (state.move.continue) {
            if (state.move.offset >= script.byteLength) {
                console.warn("MoveScript error: offset > length");
                state.move.offset = -1;
                break;
            }
            const opcode = script.getUint8(state.move.offset++, true);
            /*console.debug("opcode: " + opcode);
            console.debug("state: ", state.move);
            console.debug("opcode def: ", MoveOpcode[opcode]);
            console.debug(MoveOpcode[opcode].command);*/
            MoveOpcode[opcode].callback(script, state.move, actor);
            state.move.offset += MoveOpcode[opcode].offset;
        }
    }
}
