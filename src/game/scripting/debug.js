import {DISPLAY_SCRIPT_LINE, DISPLAY_SCRIPT_MOVE} from '../../debugFlags';

export function initDebugForScene(scene) {
    window.dispatchEvent(new CustomEvent('lba_ext_event_out', {detail: {type: 'setScene', index: scene.index, actors: scene.actors.length + 1}}));
    window.addEventListener('lba_ext_event_in', function(event) {
        const message = event.detail;
        console.log('msg:', message);
        if (message.type == 'selectActor') {
            if (message.index > 0) {
                console.log(scene.actors[message.index - 1]);
            }
        }
    });
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
