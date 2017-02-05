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
    const state = {
        type: type,
        actor: actor,
        comportement: 0,
        newComportement: (type == 'life'),
        comportementMap: {},
        opMap: {},
        tracksMap: {},
        ifStack: [],
        offset: 0,
        indent: 0,
        commands: []
    };
    while (state.offset < script.byteLength) {
        checkEndIf(state);
        state.opMap[state.offset] = state.commands.length;
        const code = script.getUint8(state.offset);
        const op = type == 'life' ? LifeOpcode[code] : MoveOpcode[code];
        checkNewComportment(state, code);
        try {
            const cmd = parseCommand(state, script, op);
            state.commands.push(cmd);
            state.offset += cmd.length;
        } catch (e) {
            console.error(`Interrupted parsing actor ${actor}'s ${type} script:\n`, e);
            break;
        }
    }
    return {
        activeLine: -1,
        opMap: state.opMap,
        comportementMap: state.comportementMap,
        tracksMap: state.tracksMap,
        commands: state.commands
    };
}

function checkEndIf(state) {
    while (state.ifStack.length > 0 && state.offset == last(state.ifStack)) {
        state.commands.push({
            name: LifeOpcode[0x10].command, // ENDIF
            indent: --state.indent,
            length: 0
        });
        state.ifStack.pop();
    }
}

function checkNewComportment(state, code) {
    if (code != 0 && state.newComportement) {
        if (state.comportement > 0) {
            state.commands.push({name: '', indent: 0, length: 0});
        }
        state.comportementMap[state.offset] = state.comportement;
        state.commands.push({
            name: LifeOpcode[0x20].command, // COMPORTEMENT
            indent: 0,
            length: 0,
            args: [{hide: false, value: state.comportement++}]
        });
        state.indent = 1;
        state.newComportement = false;
    }
}

function postProcess(scripts, actor) {
    const lifeScript = scripts[actor].life;
    const moveScript = scripts[actor].move;
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
            case 'SET_TRACK':
                cmd.args[0].value = moveScript.tracksMap[cmd.args[0].value];
                break;
            case 'SET_TRACK_OBJ':
                const tgt2 = scripts[cmd.args[0].value];
                if (tgt2) {
                    cmd.args[1].value = tgt2.move.tracksMap[cmd.args[1].value];
                }
                break;
        }
    });
}

function parseCommand(state, script, op) {
    if (!op) {
        return invalidCommand(state, script);
    }
    const cmd = {
        name: op.command,
        length: 1
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
    } else if (op.command == 'ELSE') {
        state.ifStack[state.ifStack.length - 1] = cmd.args[0].value;
    }
    if (op.command == "END_COMPORTEMENT") {
        state.newComportement = true;
    }
    if (op.command == "TRACK") {
        state.tracksMap[state.offset] = cmd.args[0].value;
    }
    processIndent(state, op, cmd);
    return cmd;
}

function parseCondition(state, script, op, cmd) {
    let condition;
    if (op.condition) {
        const code = script.getUint8(state.offset + cmd.length);
        condition = ConditionOpcode[code];
        cmd.condition = { name: condition.command };
        cmd.length += 1;
        if (condition.param) {
            cmd.condition.param = script.getUint8(state.offset + cmd.length);
            cmd.length += 1;
        }
        if (op.command == 'SWITCH') {
            state.switchCondition = condition;
        }
    } else if (op.operator) {
        condition = state.switchCondition;
    }
    if (op.operator) {
        const code = script.getUint8(state.offset + cmd.length);
        const operator = OperatorOpcode[code];
        cmd.operator = { name: operator ? operator.command : '?[' + code + ']' };
        cmd.length += 1;
        cmd.operator.operand = script['get' + condition.operand](state.offset + cmd.length, true);
        cmd.length += TypeSize[condition.operand];
    }
}

function parseArguments(state, script, op, cmd) {
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
                value: script[`get${type}`](state.offset + cmd.length, true),
                hide: hide
            });
            cmd.length += TypeSize[type];
        }
        if (op.command == 'SET_DIRMODE' || op.command == 'SET_DIRMODE_OBJ') {
            const mode = last(cmd.args).value;
            if (mode == 2 || mode == 4) {
                cmd.args.push({
                    value: script.getUint8(state.offset + cmd.length, true),
                    hide: false
                });
                cmd.length += 1;
            }
        }
    }
}

function processIndent(state, op, cmd) {
    switch (op.indent) {
        case Indent.ZERO:
            state.indent = 0;
            cmd.indent = 0;
            break;
        case Indent.ONE:
            state.indent = 1;
            cmd.indent = 1;
            break;
        case Indent.ADD:
            cmd.indent = state.indent;
            state.indent++;
            break;
        case Indent.SUB:
            state.indent = Math.max(state.indent - 1, 0);
            cmd.indent = state.indent;
            break;
        case Indent.SUB_ADD:
            state.indent = Math.max(state.indent - 1, 0);
            cmd.indent = state.indent;
            state.indent++;
            break;
        case Indent.KEEP:
        default:
            cmd.indent = state.indent;
            break;
    }
}

function invalidCommand(state, script) {
    const code = script.getUint8(state.offset);
    console.warn('Invalid command (', state.type, ') opcode =', code, 'actor =', state.actor, 'offset =', state.offset);
    return {
        name: '[INVALID COMMAND]',
        length: 1,
        indent: state.indent,
        args: [{hide: false, value: code}]
    };
}
