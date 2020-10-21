import {map} from 'lodash';
import Game from '../game/Game';
import Scene from '../game/Scene';
import Actor from '../game/Actor';

export function compileScripts(game: Game, scene: Scene, actor: Actor) {
    compileScript('life', game, scene, actor);
    compileScript('move', game, scene, actor);
    actor.scripts.life.context.moveState = actor.scripts.move.context.state;
    actor.scripts.move.context.lifeState = actor.scripts.life.context.state;
}

function compileScript(type: 'life' | 'move', game: Game, scene: Scene, actor: Actor) {
    const script = actor.scripts[type];
    const state = type === 'life'
        ? {
            reentryOffset: 0
        }
        : {
            reentryOffset: 0,
            stopped: true,
            trackIndex: -1,
            sampleLoopCount: 0,
        };
    const compileState = { section: -1 };
    script.context = {game, scene, actor, state, type};
    script.instructions = map(script.commands, (cmd, idx) =>
        compileInstruction(script, cmd, idx + 1, compileState));
}

function compileInstruction(script, cmd, cmdOffset, compileState) {
    const args = [script.context];
    let condition = null;

    if (cmd.op.command === 'BEHAVIOUR' || cmd.op.command === 'TRACK') {
        compileState.section = cmd.args[0].value;
    }

    if (cmd.op.cmdState) {
        args.push({});
    }

    if (cmd.condition) {
        condition = compileCondition(script, cmd);
        args.push(condition);
    }

    if (cmd.operator) {
        args.push(compileOperator(cmd));
    }

    if (cmd.args) {
        for (const arg of cmd.args) {
            args.push(compileValue(script, arg));
        }
    }

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

function compileCondition(script, cmd) {
    return cmd.condition.op.handler.bind(script.context,
        compileValue(script, cmd.condition.param));
}

function compileOperator(cmd) {
    return cmd.operator.op.handler.bind(null, cmd.operator.operand.value);
}

function compileValue(script, value) {
    if (!value)
        return undefined;

    switch (value.type) {
        case 'actor':
            return script.context.scene.actors[value.value];
        case 'point':
            return script.context.scene.points[value.value];
        default:
            return value.value;
    }
}
