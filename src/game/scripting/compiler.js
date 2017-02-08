import {each, map} from 'lodash';
import {setCursorPosition} from './debug';

export function compileScripts(game, scene, actor) {
    compileScript('life', game, scene, actor);
    compileScript('move', game, scene, actor);
    actor.scripts.life.moveState = actor.scripts.move.state;
    actor.scripts.move.lifeState = actor.scripts.life.state;
}

function compileScript(type, game, scene, actor) {
    const script = actor.scripts[type];
    const state = {
        offset: 0,
        reentryOffset: 0,
        continue: true
    };
    script.context = {game, scene, actor, state, type};
    script.instructions = map(script.commands, (cmd, idx) => compileInstruction(script.context, script, type, cmd, idx));
}

function compileInstruction(context, script, type, cmd, idx) {
    const args = [context];

    if (cmd.condition) {
        args.push(compileCondition(context, cmd));
    }

    if (cmd.operator) {
        args.push(compileOperator(cmd));
    }

    each(cmd.args, arg => {
        args.push(compileArgument(script, arg));
    });

    const callback = cmd.op.callback;
    const run = callback.bind.apply(callback, args);
    return (time) => {
        setCursorPosition(context.scene, context.actor, type, idx);
        run(time);
    };
}

function compileCondition(context, cmd) {
    return cmd.condition.op.callback.bind(context, cmd.condition.param);
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