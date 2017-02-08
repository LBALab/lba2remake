import {each, map, filter, isEmpty} from 'lodash';
import {parseScript} from './parser';

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
    const state = initState(type);
    const commands = filter(
        map(script.commands, (cmd, idx) => {
            const callback = cmd.op.callback;
            return {
                line: idx,
                run: callback.bind.apply(callback, compileArguments(state, scene, cmd))
            };
        }),
        cmd => cmd != null
    );
    return {state, commands};
}

function compileArguments(state, scene, cmd) {
    const args = [null, state];

    if (cmd.condition) {
        args.push(compileCondition(state, scene, cmd));
    }

    each(cmd.args, arg => {
        args.push(arg.value);
    });
    return args;
}

function compileCondition(state, scene, cmd) {
    const callback = cmd.condition.op.callback;
    return {
        getValue: () => callback.bind(null, state, cmd.condition.param)
    }
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

function runScript(script, time) {
    if (isEmpty(script))
        return;

    script.state.offset = script.state.reentryOffset;
    script.state.continue = script.state.offset != -1;
    script.state.elapsedTime = time.elapsed * 1000;
    if (script.state.offset >= 0) {
        while (script.state.continue) {
            if (script.state.offset >= script.length) {
                console.warn("Unexpectedly reached end of script");
                script.state.offset = -1;
                break;
            }
            const cmd = script.commands[script.state.offset];
            cmd.run();
            if (script.state.continue) {
                script.state.offset++;
            }
        }
    }
}