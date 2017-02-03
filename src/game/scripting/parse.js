import {LifeOpcode} from './data/life';
import {MoveOpcode} from './data/move';
import {ConditionOpcode} from './data/condition';
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
    let indent = 0;
    let offset = 0;
    if (type == 'life' && script.getUint8(offset) != 0x20) {
        commands.push({
            name: LifeOpcode[0x20].command,
            indent: 0,
            length: 0,
            args: [0]
        });
        indent++;
    }
    while (offset < script.byteLength) {
        opMap[offset] = commands.length;
        const code = script.getUint8(offset);
        const op = type == 'life' ? LifeOpcode[code] : MoveOpcode[code];
        let cmd;
        if (op) {
            cmd = parseCommand(script, offset, op);
            indent = processIndent(cmd, last(commands), op, indent);
        } else {
            console.warn('Invalid command (', type, ') opcode =', script.getUint8(offset), 'actor =', actor, 'offset =', offset);
            cmd = {
                name: '[INVALID COMMAND]',
                length: 1,
                indent: indent
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
        const code = script.getUint8(offset + 1);
        const condition = ConditionOpcode[code];
        cmd.condition = { name: condition.command };
        cmd.length += condition.param + condition.value_size + 4;
    }
}

function parseArguments(cmd, script, offset, op) {
    if (op.args) {
        let o = 1;
        cmd.args = [];
        for (let i = 0; i < op.args.length; ++i) {
            cmd.args.push(script['get' + op.args[i]](offset + o));
            cmd.length += TypeSize[op.args[i]];
            o += TypeSize[op.args[i]];
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
