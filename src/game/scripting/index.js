import async from 'async';
import _ from 'lodash';

import {MoveOpcode} from './moveScript';

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
            MoveOpcode[opcode].callback(script, state.move, actor);
            state.move.offset += MoveOpcode[opcode].offset;
            /*console.debug("opcode: " + opcode);
            console.debug("state: ", state.move);
            console.debug("opcode def: ", MoveOpcode[opcode]);
            console.debug(MoveOpcode[opcode].command);*/
        }
    }
}
