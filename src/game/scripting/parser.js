import {LifeOpcode} from './data/life';
import {MoveOpcode} from './data/move';
import {ConditionOpcode} from './data/condition';
import {OperatorOpcode} from './data/operator';
import Indent from './indent';
import {last, each} from 'lodash';

const TypeSize = {
    'Int8': 1,
    'Uint8': 1,
    'Int16': 2,
    'Uint16': 2,
    'Int32': 4,
    'Uint32': 4,
};

export function parseAllScripts(scene) {
    const scripts = {};
    scripts[0] = {
        life: parseScript(0, 'life', scene.data.hero.lifeScript),
        move: parseScript(0, 'move', scene.data.hero.moveScript)
    };
    each(scene.actors, actor => {
        scripts[actor.index] = {
            life: parseScript(actor.index, 'life', actor.props.lifeScript),
            move: parseScript(actor.index, 'move', actor.props.moveScript)
        };
    });
    postProcess(scripts, 0);
    each(scene.actors, actor => {
        postProcess(scripts, actor.index);
    });
    return scripts;
}

function parseScript(actor, type, script) {
    const commands = [];
    const opMap = {};
    const comportementMap = {};
    const ifStack = [];
    let indent = 0;
    let offset = 0;
    let comportement = 0;
    let newComportement = (type == 'life');
    while (offset < script.byteLength) {
        while (ifStack.length > 0 && offset == last(ifStack)) {
            commands.push({
                name: LifeOpcode[0x10].command, // ENDIF
                indent: --indent,
                length: 0
            });
            ifStack.pop();
        }
        opMap[offset] = commands.length;
        const code = script.getUint8(offset);
        if (code != 0 && newComportement) {
            if (comportement > 0) {
                commands.push({name: '', indent: 0, length: 0});
            }
            comportementMap[offset] = comportement;
            commands.push({
                name: LifeOpcode[0x20].command, // COMPORTEMENT
                indent: 0,
                length: 0,
                args: [{hide: false, value: comportement++}]
            });
            indent = 1;
            newComportement = false;
        }
        const op = type == 'life' ? LifeOpcode[code] : MoveOpcode[code];
        let cmd;
        try {
            if (op) {
                cmd = parseCommand(script, offset, op);
                if (op.condition && !op.precond && cmd.args) {
                    ifStack.push(cmd.args[0].value);
                } else if (op.command == 'ELSE') {
                    ifStack[ifStack.length - 1] = cmd.args[0].value;
                }
                if (op.command == "END_COMPORTEMENT") {
                    newComportement = true;
                }
                indent = processIndent(cmd, last(commands), op, indent);
            } else {
                console.warn('Invalid command (', type, ') opcode =', code, 'actor =', actor, 'offset =', offset);
                cmd = {
                    name: '[INVALID COMMAND]',
                    length: 1,
                    indent: indent,
                    args: [{hide: false, value: code}]
                };
            }
            commands.push(cmd);
            offset += cmd.length;
        } catch (e) {
            console.error(`Interrupted parsing actor ${actor}'s ${type} script:\n`, e);
            break;
        }
    }
    return {
        activeLine: -1,
        opMap: opMap,
        comportementMap: comportementMap,
        commands: commands
    };
}

function postProcess(scripts, actor) {
    const lifeScript = scripts[actor].life;
    each(lifeScript.commands, cmd => {
        switch (cmd.name) {
            case 'SET_COMPORTEMENT':
                cmd.args[0].value = lifeScript.comportementMap[cmd.args[0].value];
                break;
            case 'SET_COMPORTEMENT_OBJ':
                const tgt = scripts[cmd.args[0].value];
                if (tgt) {
                    cmd.args[1].value = tgt.life.comportementMap[cmd.args[1].value];
                }
                break;
        }
    });
}

function parseCommand(script, offset, op) {
    const cmd = {
        name: op.command,
        length: 1
    };
    parseCondition(cmd, script, offset, op);
    parseArguments(cmd, script, offset, op);
    return cmd;
}

function parseCondition(cmd, script, offset, op) {
    if (op.condition) {
        const code = script.getUint8(offset + cmd.length);
        const condition = ConditionOpcode[code];
        if (condition) {
            cmd.condition = { name: condition.command };
            cmd.length += 1;
            if (condition.param) {
                cmd.condition.param = script.getUint8(offset + cmd.length);
                cmd.length += 1;
            }
            if (op.operator) {
                const code = script.getUint8(offset + cmd.length);
                const operator = OperatorOpcode[code];
                cmd.condition.operator = { name: operator ? operator.command : '?[' + code + ']' };
                cmd.length += 1;
                cmd.condition.operator.operand = script['get' + condition.operand](offset + cmd.length, true);
                cmd.length += TypeSize[condition.operand];
            }
        }
    }
}

function parseArguments(cmd, script, offset, op) {
    if (op.args) {
        cmd.args = [];
        for (let i = 0; i < op.args.length; ++i) {
            let type = op.args[i];
            let hide = false;
            if (type[0] == '_') {
                type = type.substr(1);
                hide = true;
            }
            cmd.args.push({
                value: script[`get${type}`](offset + cmd.length, true),
                hide: hide
            });
            cmd.length += TypeSize[type];
        }
    }
}

function processIndent(cmd, prevCmd, op, indent) {
    switch (op.indent) {
        case Indent.ZERO:
            indent = 0;
            cmd.indent = 0;
            break;
        case Indent.ONE:
            indent = 1;
            cmd.indent = 1;
            break;
        case Indent.ADD:
            cmd.indent = indent;
            indent++;
            break;
        case Indent.SUB:
            indent = Math.max(indent - 1, 0);
            cmd.indent = indent;
            break;
        case Indent.SUB_ADD:
            indent = Math.max(indent - 1, 0);
            cmd.indent = indent;
            indent++;
            break;
        case Indent.SPECIAL_CASE:
            if (prevCmd && prevCmd.name != 'CASE' && prevCmd.name != 'SWITCH') {
                indent = Math.max(indent - 1, 0);
            }
            cmd.indent = indent;
            indent++;
            break;
        case Indent.KEEP:
        default:
            cmd.indent = indent;
            break;
    }
    return indent;
}
