import {LifeOpcode} from './data/life';
import {MoveOpcode} from './data/move';
import {ConditionOpcode} from './data/condition';
import {OperatorOpcode} from './data/operator';
import Indent from './indent';
import {
    last,
    each,
    map,
    filter,
    isEmpty
} from 'lodash';

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
    each(scene.actors, actor => {
        scripts[actor.index] = {
            life: parseScript(actor.index, 'life', actor.props.lifeScript),
            move: parseScript(actor.index, 'move', actor.props.moveScript)
        };
    });
    each(scene.actors, actor => {
        buildRunnableScript(scene, scripts, actor);
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
        opcode: op.opcode,
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
            if (type == 'string') {
                let arg = '';
                let o = 0;
                let c;
                do {
                    c = script.getUint8(state.offset + cmd.length + o);
                    if (c != 0) {
                        arg += String.fromCharCode(c);
                    }
                    o++;
                } while (c != 0);
                cmd.args.push({
                    value: arg,
                    hide: hide
                });
                cmd.length += o;
            } else {
                cmd.args.push({
                    value: script[`get${type}`](state.offset + cmd.length, true),
                    hide: hide
                });
                cmd.length += TypeSize[type];
            }
        }
        if (op.command == 'SET_DIRMODE' || op.command == 'SET_DIRMODE_OBJ') {
            const mode = last(cmd.args).value;
            if (mode == 2 || mode == 4 || mode == 6 || mode == 11) {
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

function buildRunnableScript(scene, scripts, actor) {
    const runnableScript = {};
    runnableScript.life = compileCommands('life', scene, actor, scripts[actor.index].life);
    runnableScript.move = compileCommands('move', scene, actor, scripts[actor.index].move);
    actor.runScripts = function(time) {
        runScript(runnableScript.life, actor.scriptState.life, time);
        runScript(runnableScript.move, actor.scriptState.move, time);
    };
}

function compileCommands(type, scene, actor, script) {
    const state = initState(type);
    return filter(
        map(script.commands, (cmd, idx) => {
            if (cmd.opcode) {
                const OpCodes = type == 'life' ? LifeOpcode : MoveOpcode;
                const callback = OpCodes[cmd.opcode].callback;
                return {
                    line: idx,
                    run: callback.bind.apply(callback, compileArguments(state, scene, cmd))
                };
            }
        }),
        cmd => cmd != null
    );
}

function compileArguments(state, scene, cmd) {
    const args = [null, state];

    each(cmd.args, arg => {
        args.push(arg);
    });
    return args;
}

function initState(type) {
    if (type == 'life') {
        return {
            offset: 0,
            reentryOffset: 0,
            continue: true
        };
    } else {
        return {
            offset: 0,
            reentryOffset: 0,
            savedOffset: 0,
            continue: true,
            elapsedTime: 0,
            waitTime: 0,
            isWaiting: false
        };
    }
}

function runScript(script, state, time) {
    if (isEmpty(script))
        return;

    state.offset = state.reentryOffset;
    state.continue = state.offset != -1;
    state.elapsedTime = time.elapsed * 1000;
    if (state.move.offset >= 0) {
        while (state.continue) {
            if (state.offset >= script.length) {
                console.warn("Unexpectedly reached end of script");
                state.offset = -1;
                break;
            }
            const cmd = script[state.offset];
            cmd.run();
            if (state.continue) {
                state.offset++;
            }
        }
    }
}