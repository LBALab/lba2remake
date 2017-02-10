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
    script.instructions = map(script.commands, (cmd, idx) => compileInstruction(script, cmd, idx + 1));
}

function compileInstruction(script, cmd, cmdOffset) {
    const args = [script.context];

    if (cmd.condition) {
        args.push(compileCondition(script, cmd));
    }

    if (cmd.operator) {
        args.push(compileOperator(cmd));
    }

    each(cmd.args, arg => {
        args.push(compileValue(script, arg, cmdOffset));
    });

    postProcess(script, cmd, args);

    const callback = cmd.op.callback;
    return callback.bind.apply(callback, args);
}

function compileCondition(script, cmd) {
    return cmd.condition.op.callback.bind(script.context, compileValue(script, cmd.condition.param));
}

function compileOperator(cmd) {
    return cmd.operator.op.callback.bind(null, cmd.operator.operand);
}

function compileValue(script, value, cmdOffset) {
    if (!value)
        return undefined;

    switch (value.type) {
        case 'offset':
            if (script.opMap[value.value] == undefined) {
                console.warn(`Failed to parse offset: ${script.context.scene.index}:${script.context.actor.index}:${script.context.type}:${cmdOffset} offset=${value.value}`);
            }
            return script.opMap[value.value];
        case 'actor':
            return script.context.scene.getActor(value.value);
        default:
            return value.value;
    }
}

function postProcess(script, cmd, args) {
    switch (cmd.op.command) {
        case 'SET_TRACK':
            args[1] = script.context.actor.scripts.move.opMap[args[1]];
            break;
        case 'SET_TRACK_OBJ':
            args[2] = args[1].scripts.move.opMap[args[2]];
            break;
        case 'SET_COMPORTEMENT_OBJ':
            args[2] = args[1].scripts.life.opMap[args[2]];
            break;
    }
}
