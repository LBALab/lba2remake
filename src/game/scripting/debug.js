import {DISPLAY_SCRIPT_LINE, DISPLAY_SCRIPT_MOVE} from '../../debugFlags';
import {LifeOpcode} from './data/life';
import {MoveOpcode} from './data/move';

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
        if (!op)
            break;
        commands.push({name: op.command});
        offset += op.offset + 1;
    }
    return commands;
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
