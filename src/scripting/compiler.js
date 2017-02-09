import {each, map} from 'lodash';

export function compileScripts(game, scene, actor) {
    compileScript('life', game, scene, actor);
    compileScript('move', game, scene, actor);
    actor.scripts.life.context.moveState = actor.scripts.move.context.state;
    actor.scripts.move.context.lifeState = actor.scripts.life.context.state;
}

function compileScript(type, game, scene, actor) {
    const script = actor.scripts[type];
    const state = {
        offset: 0,
        reentryOffset: 0,
        continue: true
    };
    script.context = {game, scene, actor, state, type};
    script.instructions = map(script.commands, cmd => compileInstruction(script, cmd));
}

function compileInstruction(script, cmd) {
    const args = [script.context];

    if (cmd.condition) {
        args.push(compileCondition(script, cmd));
    }

    if (cmd.operator) {
        args.push(compileOperator(cmd));
    }

    each(cmd.args, arg => {
        args.push(compileValue(script, arg));
    });

    const callback = cmd.op.callback;
    return callback.bind.apply(callback, args);
}

function compileCondition(script, cmd) {
    return cmd.condition.op.callback.bind(script.context, compileValue(script, cmd.condition.param));
}

function compileOperator(cmd) {
    return cmd.operator.op.callback.bind(null, cmd.operator.operand);
}

function compileValue(script, value) {
    if (!value)
        return undefined;

    switch (value.type) {
        case 'offset':
            // if (script.opMap[value.value] == undefined) {
            //     console.log(script.context.scene.index, script.context.actor.index, value.value, script);
            // }
            return script.opMap[value.value];
        case 'actor':
            return script.context.scene.getActor(value.value);
        default:
            return value.value;
    }
}