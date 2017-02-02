import {DISPLAY_SCRIPT_LINE, DISPLAY_SCRIPT_MOVE} from '../../debugFlags';
import {LifeOpcode} from './data/life';
import {MoveOpcode} from './data/move';
import {ConditionOpcode} from './data/condition';

export function initDebugForScene(scene) {
    window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
        detail: {
            type: 'setScene',
            index: scene.index, actors: scene.actors.length + 1
        }
    }));
    window.addEventListener('lba_ext_event_in', function(event) {
        const message = event.detail;
        if (message.type == 'selectActor') {
            const actor = message.index == 0 ? scene.data.hero : scene.data.actors[message.index - 1];
            window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
                detail: {
                    type: 'setActorScripts',
                    life: decompileScript(actor.lifeScript, LifeOpcode),
                    move: decompileScript(actor.moveScript, MoveOpcode)
                }
            }));
        }
    });
}

function decompileScript(script, Opcodes) {
    let offset = 0;
    const commands = [];
    while (offset < script.byteLength) {
        const opcode = script.getUint8(offset);
        const op = Opcodes[opcode];
        if (!op) {
            commands.push({name: '&lt;ERROR PARSING SCRIPT&gt;'});
            break;
        }
        commands.push({name: op.command});
        offset = getNewOffset(script, offset, op);
    }
    return commands;
}

function getNewOffset(script, offset, op) {
    let extraOffset = 0;
    switch (op.command) {
        case 'IF':
        case 'SWIF':
        case 'SNIF':
        case 'ONEIF':
        case 'NEVERIF':
        case 'ORIF':
        case 'AND_IF':
        case 'SWITCH':
            const cond_code = script.getUint8(offset + 1);
            const cond = ConditionOpcode[cond_code];
            extraOffset = cond.param + cond.value_size + 4;
            break;
    }
    return offset + extraOffset + op.offset + 1;
}

export function initDebug() {
    return {
        lines: [],
        index: -1
    };
}

export function displayLife(debug) {
    if (DISPLAY_SCRIPT_LINE) {
        console.debug(debug.lines[debug.index]);
    }
}

export function setLife(debug, opcode) {
    if (DISPLAY_SCRIPT_LINE) {
        debug.lines.push(opcode);
        debug.index++;
    }
}

export function addLife(debug, value) {
    if (DISPLAY_SCRIPT_LINE) {
        debug.lines[debug.index] += value;
    }
}


export function displayMove(debug) {
    if (DISPLAY_SCRIPT_MOVE) {
        console.debug(debug.lines[debug.index]);
    }
}

export function setMove(debug, opcode) {
    if (DISPLAY_SCRIPT_MOVE) {
        debug.lines.push(opcode);
        debug.index++;
    }
}

export function addMove(debug, value) {
    if (DISPLAY_SCRIPT_MOVE) {
        debug.lines[debug.index] += value;
    }
}
