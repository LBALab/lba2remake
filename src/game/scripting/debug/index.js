import {DISPLAY_SCRIPT_LINE, DISPLAY_SCRIPT_MOVE} from '../../../debugFlags';

const push = Array.prototype.push;

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
