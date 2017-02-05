import {LifeOpcode} from './data/life';
import {MoveOpcode} from './data/move';
import {ConditionOpcode} from './data/condition';
import {OperatorOpcode} from './data/operator';
import Indent from './indent';
import {last} from 'lodash';

const TypeSize = {
    'Int8': 1,
    'Uint8': 1,
    'Int16': 2,
    'Uint16': 2,
    'Int32': 4,
    'Uint32': 4,
};

export function parseScript(actor, type, script) {
    const commands = [];
    const opMap = {};
    const ifStack = [];
    let indent = 0;
    let offset = 0;
    if (type == 'life' && script.getUint8(offset) != 0x20 && script.getUint8(offset) != 0x00) {
        commands.push({
            name: LifeOpcode[0x20].command, // COMPORTEMENT
            indent: 0,
            length: 0,
            args: [{hide: false, value: 0}]
        });
        indent++;
    }
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
        const op = type == 'life' ? LifeOpcode[code] : MoveOpcode[code];
        let cmd;
        if (op) {
            cmd = parseCommand(script, offset, op);
            if (op.condition && !op.precond && cmd.args) {
                ifStack.push(cmd.args[0].value);
            } else if (op.command == 'ELSE') {
                ifStack[ifStack.length - 1] = cmd.args[0].value;
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
    }
    return {
        activeLine: -1,
        opMap: opMap,
        commands: commands
    };
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
