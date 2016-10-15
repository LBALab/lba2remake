import async from 'async';
import _ from 'lodash';

import {MOVE_OPCODE} from './moveScript';

export function initScriptState() {
    return {
        life: { 
            offset: 0,
            continue: true
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
    const script = actor.lifeScript;
    if (script.byteLength > 0 && state.life.offset >= 0) {
        do {
            const opcode = script.getUint8(state.life.offset++, true);
            // RUN OPCODE
        } while(state.life.continue);
    }
}

export function processMoveScript(actor) {
    const state = actor.scriptState;
    const script = actor.moveScript;
    state.continue = true;
    if (script.byteLength > 0 && state.move.offset >= 0) {
        while (state.move.continue) {
            if (state.move.offset >= script.byteLength) {
                console.warn("MoveScript error: offset > length");
                state.move.offset = -1;
                break;
            }
            const opcode = script.getUint8(state.move.offset++, true);
            MOVE_OPCODE[opcode].callback(script, state.move, actor);
            state.move.offset += MOVE_OPCODE[opcode].offset;
            /*console.debug("opcode: " + opcode);
            console.debug("state: ", state.move);
            console.debug("opcode def: ", MOVE_OPCODE[opcode]);
            console.debug(MOVE_OPCODE[opcode].command);*/
        }
    }
}
