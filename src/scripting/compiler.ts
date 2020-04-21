import {each, map} from 'lodash';

export function compileScripts(game, scene, actor) {
    compileScript('life', game, scene, actor);
    compileScript('move', game, scene, actor);
    actor.scripts.life.context.moveState = actor.scripts.move.context.state;
    actor.scripts.move.context.lifeState = actor.scripts.life.context.state;
}

function compileScript(type, game, scene, actor) {
    const script = actor.scripts[type];
    const state = type === 'life'
        ? {
            reentryOffset: 0
        }
        : {
            reentryOffset: 0,
            stopped: true,
            trackIndex: -1
        };
    const compileState = { section: -1 };
    script.context = {game, scene, actor, state, type};
    script.instructions = map(script.commands, (cmd, idx) =>
        compileInstruction(script, cmd, idx + 1, compileState));
}

function compileInstruction(script, cmd, cmdOffset, compileState) {
    const args = [script.context];
    let condition = null;

    if (cmd.op.command === 'COMPORTEMENT' || cmd.op.command === 'TRACK') {
        compileState.section = cmd.args[0].value;
    }

    if (cmd.op.cmdState) {
        args.push({});
    }

    if (cmd.condition) {
        condition = compileCondition(script, cmd, cmdOffset);
        args.push(condition);
    }

    if (cmd.operator) {
        args.push(compileOperator(cmd));
    }

    each(cmd.args, (arg) => {
        args.push(compileValue(script, arg, cmdOffset));
    });

    postProcess(script, cmd, cmdOffset, args);

    const handler = cmd.op.handler;
    const instruction = handler.bind(...args);
    instruction.dbgLabel = `${cmdOffset} ${cmd.op.command}`;
    instruction.section = compileState.section;
    if (condition)
        instruction.condition = condition;
    if (cmd.op.skipSideScenes) {
        instruction.skipSideScenes = true;
    }
    return instruction;
}

function compileCondition(script, cmd, cmdOffset) {
    return cmd.condition.op.handler.bind(script.context,
        compileValue(script, cmd.condition.param, cmdOffset));
}

function compileOperator(cmd) {
    return cmd.operator.op.handler.bind(null, cmd.operator.operand.value);
}

function compileValue(script, value, cmdOffset) {
    if (!value)
        return undefined;

    switch (value.type) {
        case 'offset':
            if (script.opMap[value.value] === undefined) {
                // tslint:disable-next-line:no-console max-line-length
                console.warn(`Failed to parse offset: ${script.context.scene.index}:${script.context.actor.index}:${script.context.type}:${cmdOffset} offset=${value.value}`);
            }
            return script.opMap[value.value];
        case 'actor':
            return script.context.scene.actors[value.value];
        case 'point':
            return script.context.scene.points[value.value];
        default:
            return value.value;
    }
}

function postProcess(script, cmd, cmdOffset, args) {
    let opMap;
    switch (cmd.op.command) {
        case 'SET_TRACK':
            opMap = script.context.actor.scripts.move.opMap;
            if (opMap[args[1]] === undefined) {
                // tslint:disable-next-line:no-console max-line-length
                console.warn(`Failed to parse SET_TRACK offset: ${script.context.scene.index}:${script.context.actor.index}:${script.context.type}:${cmdOffset} offset=${args[1]}`);
            }
            args[1] = opMap[args[1]];
            break;
        case 'SET_TRACK_OBJ':
            opMap = args[1].scripts.move.opMap;
            if (opMap[args[2]] === undefined) {
                // tslint:disable-next-line:no-console max-line-length
                console.warn(`Failed to parse SET_TRACK_OBJ offset: ${script.context.scene.index}:${script.context.actor.index}:${script.context.type}:${cmdOffset} offset=${args[2]}`);
            }
            args[2] = opMap[args[2]];
            break;
        case 'SET_COMPORTEMENT_OBJ':
            opMap = args[1].scripts.life.opMap;
            if (opMap[args[2]] === undefined) {
                // tslint:disable-next-line:no-console max-line-length
                console.warn(`Failed to parse SET_COMPORTEMENT_OBJ offset: ${script.context.scene.index}:${script.context.actor.index}:${script.context.type}:${cmdOffset} offset=${args[2]}`);
            }
            args[2] = opMap[args[2]];
            break;
    }
}
