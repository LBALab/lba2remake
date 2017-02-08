import {each, map, filter, isEmpty} from 'lodash';
import {parseScript} from './parser';
import {setCursorPosition} from './debug';

export function loadScripts(scene) {
    each(scene.actors, actor => {
        actor.scripts = {
            life: parseScript(actor.index, 'life', actor.props.lifeScript),
            move: parseScript(actor.index, 'move', actor.props.moveScript)
        };
    });
    each(scene.actors, actor => {
        actor.runScripts = compileScripts(scene, actor);
    });
}

function compileScripts(scene, actor) {
    const life = compileScript('life', scene, actor);
    const move = compileScript('move', scene, actor);
    return time => {
        runScript(life, time);
        runScript(move, time);
    };
}

function compileScript(type, scene, actor) {
    const script = actor.scripts[type];
    const state = {
        offset: 0,
        reentryOffset: 0,
        continue: true
    };
    const commands = map(script.commands, (cmd, idx) => compileCommand(script, type, scene, actor, state, cmd, idx));
    return {state, commands};
}

function compileCommand(script, type, scene, actor, state, cmd, idx) {
    const args = [null, state];

    if (cmd.condition) {
        args.push(compileCondition(state, scene, cmd));
    }

    if (cmd.operator) {
        args.push(compileOperator(cmd));
    }

    each(cmd.args, arg => {
        args.push(compileArgument(script, arg));
    });

    const callback = cmd.op.callback;
    const run = callback.bind.apply(callback, args);
    return () => {
        setCursorPosition(scene, actor, type, idx);
        run();
    };
}

function compileCondition(state, scene, cmd) {
    return cmd.condition.op.callback.bind(null, state, cmd.condition.param);
}

function compileOperator(cmd) {
    return cmd.operator.op.callback.bind(null, cmd.operator.operand);
}

function compileArgument(script, arg) {
    switch (arg.type) {
        case 'offset':
            return script.opMap[arg.value];
        default:
            return arg.value;
    }
}

function runScript(script, time) {
    if (isEmpty(script))
        return;

    script.state.offset = script.state.reentryOffset;
    script.state.continue = script.state.offset != -1;
    script.state.time = time;

    if (script.state.offset >= 0) {
        while (script.state.continue) {
            if (script.state.offset >= script.length) {
                console.warn("Unexpectedly reached end of script");
                script.state.offset = -1;
                break;
            }
            script.commands[script.state.offset]();
            if (script.state.continue) {
                script.state.offset++;
            }
        }
    }
}