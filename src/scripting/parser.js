import {LifeOpcode} from './data/life';
import {MoveOpcode} from './data/move';
import {ConditionOpcode} from './data/condition';
import {OperatorOpcode} from './data/operator';
import {
    last,
    each,
    map,
    filter
} from 'lodash';

const TypeSize = {
    'Int8': 1,
    'Uint8': 1,
    'Int16': 2,
    'Uint16': 2,
    'Int32': 4,
    'Uint32': 4,
};

export function parseScript(actor, type, script) {
    const state = {
        type: type,
        actor: actor,
        comportement: 0,
        newComportement: (type === 'life'),
        comportementMap: {},
        opMap: {},
        tracksMap: {},
        ifStack: [],
        offset: 0,
        commands: []
    };
    while (state.offset < script.byteLength) {
        checkEndIf(state);
        state.opMap[state.offset] = state.commands.length;
        const code = script.getUint8(state.offset);
        const op = type === 'life' ? LifeOpcode[code] : MoveOpcode[code];
        checkNewComportment(state, code);
        try {
            state.commands.push(parseCommand(state, script, op));
        } catch (e) {
            console.error(`Interrupted parsing actor ${actor}'s ${type} script:\n`, e);
            break;
        }
    }
    return {
        opMap: state.opMap,
        comportementMap: state.comportementMap,
        tracksMap: state.tracksMap,
        commands: state.commands
    };
}

function checkEndIf(state) {
    while (state.ifStack.length > 0 && state.offset === last(state.ifStack)) {
        state.commands.push({op: LifeOpcode[0x10]});
        state.ifStack.pop();
    }
}

function checkNewComportment(state, code) {
    if (code !== 0 && state.newComportement) {
        state.comportementMap[state.offset] = state.comportement;
        state.commands.push({
            op: LifeOpcode[0x20], // COMPORTEMENT
            args: [{hide: false, value: state.comportement++}]
        });
        state.newComportement = false;
    }
}

function parseCommand(state, script, op) {
    const baseOffset = state.offset++;
    const cmd = {op: op};
    if (op.argsFirst) {
        parseArguments(state, script, op, cmd);
    }
    parseCondition(state, script, op, cmd);
    if (!op.argsFirst) {
        parseArguments(state, script, op, cmd);
    }
    if (op.condition && !op.precond && cmd.args) {
        state.ifStack.push(cmd.args[0].value);
    } else if (op.command === 'ELSE') {
        state.ifStack[state.ifStack.length - 1] = cmd.args[0].value;
    }
    if (op.command === "END_COMPORTEMENT") {
        state.newComportement = true;
    }
    if (op.command === "TRACK") {
        state.tracksMap[baseOffset] = cmd.args[0].value;
    }
    return cmd;
}

function parseCondition(state, script, op, cmd) {
    let condition;
    if (op.condition) {
        const code = script.getUint8(state.offset);
        condition = ConditionOpcode[code];
        cmd.condition = { op: condition };
        state.offset++;
        if (condition.param) {
            cmd.condition.param = parseValue(state, script, condition.param);
        }
        if (op.command === 'SWITCH') {
            state.switchCondition = condition;
        }
    } else if (op.operator) {
        condition = state.switchCondition;
    }
    if (op.operator) {
        const code = script.getUint8(state.offset);
        const operator = OperatorOpcode[code];
        cmd.operator = { op: operator };
        state.offset++;
        cmd.operator.operand = script['get' + condition.operand](state.offset, true);
        state.offset += TypeSize[condition.operand];
    }
}

function parseArguments(state, script, op, cmd) {
    if (op.args) {
        cmd.args = [];
        for (let i = 0; i < op.args.length; ++i) {
            cmd.args.push(parseValue(state, script, op.args[i]));
        }
        if (op.command === 'SET_DIRMODE' || op.command === 'SET_DIRMODE_OBJ') {
            const mode = last(cmd.args).value;
            if (mode === 2 || mode === 4 || mode === 6 || mode === 10 || mode === 11) {
                cmd.args.push({
                    value: script.getUint8(state.offset, true),
                    hide: false
                });
                state.offset++;
            }
        }
    }
}

function parseValue(state, script, spec) {
    let [type, lbaType] = spec.split(':');
    let hide = false;
    if (type[0] === '_') {
        type = type.substr(1);
        hide = true;
    }
    let value;
    if (type === 'string') {
        value = '';
        let char;
        do {
            char = script.getUint8(state.offset);
            if (char !== 0) {
                value += String.fromCharCode(char);
            }
            state.offset++;
        } while (char !== 0);
    } else {
        value = script[`get${type}`](state.offset, true);
        state.offset += TypeSize[type];
    }
    return {
        type: lbaType,
        value: value,
        hide: hide
    };
}
