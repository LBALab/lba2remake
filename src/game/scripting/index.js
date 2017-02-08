import {each, map, filter} from 'lodash';
import {LifeOpcode} from './data/life';
import {MoveOpcode} from './data/move';
import {parseScript} from './parser';

export function loadScripts(scene) {
    each(scene.actors, actor => {
        actor.scripts = {
            life: parseScript(actor.index, 'life', actor.props.lifeScript),
            move: parseScript(actor.index, 'move', actor.props.moveScript)
        };
    });
    each(scene.actors, actor => {
        initScripts(scene, actor);
    });
}

function initScripts(scene, actor) {
    compileScripts(scene, actor);
    //postProcess(scripts, actor.index);
}

function compileScripts(scene, actor) {
    const life = compileScript('life', scene, actor);
    const move = compileScript('move', scene, actor);
    actor.runScripts = function(time) {
        runScript(life, time);
        runScript(move, time);
    };
}

function compileScript(type, scene, actor) {
    const script = actor.scripts[type];
    const state = initState(type);
    const commands = filter(
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
    return {state, commands};
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