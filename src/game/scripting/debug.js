import {LifeOpcode} from './data/life';
import {MoveOpcode} from './data/move';
import {ConditionOpcode} from './data/condition';

const scripts_cache = {};

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
            const scripts = getScripts(scene, message.index);
            window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
                detail: {
                    type: 'setActorScripts',
                    life: scripts.life.commands,
                    move: scripts.move.commands
                }
            }));
        }
    });
}

export function setCursorPosition(scene, index, scriptType, offset) {
    const scripts = getScripts(scene, index);
    window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
        detail: {
            type: 'setCurrentLine',
            scene: scene.index,
            actor: index,
            scriptType: scriptType,
            line: scripts[scriptType].opMap[offset]
        }
    }));
}

function getScripts(scene, index) {
    const key = scene.index + '_' + index;
    if (key in scripts_cache) {
        return scripts_cache[key];
    } else {
        const actor = index == 0 ? scene.data.hero : scene.data.actors[index - 1];
        const scripts = {
            life: decompileScript(actor.lifeScript, LifeOpcode),
            move: decompileScript(actor.moveScript, MoveOpcode)
        };
        scripts_cache[key] = scripts;
        return scripts;
    }
}

function decompileScript(script, Opcodes) {
    let offset = 0;
    const commands = [];
    const opMap = {};
    while (offset < script.byteLength) {
        const opcode = script.getUint8(offset);
        opMap[offset] = commands.length;
        const op = Opcodes[opcode];
        if (!op) {
            commands.push({name: '&lt;ERROR PARSING SCRIPT&gt;'});
            break;
        }
        commands.push({name: op.command});
        offset = getNewOffset(script, offset, op);
    }
    return {
        opMap: opMap,
        commands: commands
    };
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
