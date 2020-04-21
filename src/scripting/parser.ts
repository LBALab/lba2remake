import { last, mapKeys } from 'lodash';
import { LifeOpcode } from '../game/scripting/data/life';
import { MoveOpcode } from '../game/scripting/data/move';
import { ConditionOpcode } from '../game/scripting/data/condition';
import { OperatorOpcode } from '../game/scripting/data/operator';

const TypeSize = {
    Int8: 1,
    Uint8: 1,
    Int16: 2,
    Uint16: 2,
    Int32: 4,
    Uint32: 4,
};

export function parseScripts(actor) {
    return {
        life: parseScript(actor.index, 'life', actor.props.lifeScript),
        move: parseScript(actor.index, 'move', actor.props.moveScript)
    };
}

export function parseScript(actor, type, script) {
    const state = {
        type,
        actor,
        comportement: -1,
        track: -1,
        newComportement: (type === 'life'),
        comportementMap: {},
        opMap: {},
        tracksMap: {},
        ifStack: [],
        switchStack: [],
        offset: 0,
        commands: [],
        choice: null
    };
    while (state.offset < script.byteLength) {
        checkEndIf(state);
        state.opMap[state.offset] = state.commands.length;
        const code = script.getUint8(state.offset);
        const op = type === 'life' ? LifeOpcode[code] : MoveOpcode[code];
        checkEndSwitch(state, code);
        checkNewComportment(state, code);
        try {
            state.commands.push(parseCommand(state, script, op, type));
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.error(`Interrupted parsing actor ${actor}'s ${type} script:\n`, e);
            break;
        }
    }
    const mapOps = obj => mapKeys(obj, (_v, k) => state.opMap[k]);
    return {
        type,
        opMap: state.opMap,
        comportementMap: mapOps(state.comportementMap),
        tracksMap: mapOps(state.tracksMap),
        commands: state.commands
    };
}

function checkEndIf(state) {
    while (state.ifStack.length > 0 && state.offset === last(state.ifStack)) {
        state.commands.push({ op: LifeOpcode[0x10] });
        state.ifStack.pop();
    }
}

function checkEndSwitch(state, code) {
    while (code !== 0x76 && code !== 0x72 && code !== 0x73 && code !== 0x74
            && state.switchStack.length > 0
            && state.offset === last(state.switchStack)) {
        state.commands.push({ op: LifeOpcode[0x76] });
        state.switchStack.pop();
    }
}

function checkNewComportment(state, code) {
    if (code !== 0 && state.newComportement) {
        state.comportement += 1;
        state.comportementMap[state.offset] = state.comportement;
        state.commands.push({
            op: LifeOpcode[0x20], // COMPORTEMENT
            args: [{hide: false, value: state.comportement, type: 'label'}],
        });
        state.newComportement = false;
    }
}

interface Cmd {
    op: any;
    args?: any;
}

function parseCommand(state, script, op, _type) {
    const baseOffset = state.offset;
    state.offset += 1;
    const cmd : Cmd = {
        op,
    };
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
    if (op.command === 'SWITCH') {
        state.switchStack.push(-1);
    } else if (op.command === 'BREAK' || op.command === 'CASE') {
        state.switchStack[state.switchStack.length - 1] =
            Math.max(
                state.switchStack[state.switchStack.length - 1],
                cmd.args[0].value
            );
    } else if (op.command === 'END_SWITCH') {
        state.switchStack.pop();
    }
    if (op.command === 'END_COMPORTEMENT') {
        state.newComportement = true;
    }
    if (op.command === 'TRACK') {
        state.tracksMap[baseOffset] = cmd.args[0].value;
        state.track = cmd.args[0].value;
    }
    return cmd;
}

function parseCondition(state, script, op, cmd) {
    let condition;
    if (op.condition) {
        const code = script.getUint8(state.offset);
        condition = ConditionOpcode[code];
        cmd.condition = {
            op: condition,
            operandType: getLbaType(condition.operand)
        };
        state.offset += 1;
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
        state.offset += 1;
        cmd.operator.operand = parseValue(state, script, condition.operand);
    }
}

function parseArguments(state, script, op, cmd) {
    if (op.args) {
        cmd.args = [];
        for (let i = 0; i < op.args.length; i += 1) {
            cmd.args.push(parseValue(state, script, op.args[i]));
        }
        if (op.command === 'SET_DIRMODE' || op.command === 'SET_DIRMODE_OBJ') {
            const mode = (last(cmd.args) as any).value;
            if (mode === 2 || mode === 4 || mode === 6 || mode === 10 || mode === 11) {
                cmd.args.push({
                    value: script.getUint8(state.offset, true),
                    type: 'actor',
                    hide: false
                });
                state.offset += 1;
            } else if (mode === 9) {
                cmd.args.push({
                    value: script.getUint8(state.offset, true),
                    type: 'number',
                    hide: false
                });
                state.offset += 1;
            }
        }
    }
}

function parseValue(state, script, spec) {
    const [t, lbaType] = spec.split(':');
    let type = t;
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
            state.offset += 1;
        } while (char !== 0);
    } else {
        value = script[`get${type}`](state.offset, true);
        state.offset += TypeSize[type];
    }
    return {
        type: lbaType,
        value,
        hide
    };
}

function getLbaType(spec) {
    const value = spec.split(':');
    return value[1];
}
