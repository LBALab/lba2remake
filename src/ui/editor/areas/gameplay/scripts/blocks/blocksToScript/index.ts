import { map, filter, each, sortBy, invert, mapValues, findKey } from 'lodash';
// import jDiff from 'jest-diff';
import lifeMappings from './mappings/life';
import moveMappings from './mappings/move';
import { compileScripts } from '../../../../../../../scripting/compiler';
import DebugData from '../../../../../DebugData';
import { mapValue } from './mappings/utils';
import { ActorDirMode } from '../../../../../../../game/Actor';
import { getLifeOpcode, getMoveOpcode } from '../../../../../../../scripting/parser';

const lifeRootTypes = ['lba_behaviour', 'lba_behaviour_init'];
const moveRootTypes = ['lba_move_track', 'lba_move_replace'];

export function compile(workspace) {
    // const label = `Compiled actor ${workspace.actor.index} script`;
    // console.time(label);
    const topBlocks = workspace.getTopBlocks(false);

    const lifeScript = compileRootBlocks('life', topBlocks, lifeRootTypes);
    const moveScript = compileRootBlocks('move', topBlocks, moveRootTypes);

    postProcess(lifeScript, workspace.scene, moveScript);
    postProcess(moveScript, workspace.scene);

    // console.log(jDiff(workspace.actor.scripts.move.commands, moveScript.commands));

    const { game, hero } = DebugData.scope;
    if (game.getUiState().text) {
        game.setUiState({ text: null, skip: false, });
        game.controlsState.skipListener = null;
        hero.stopVoice();
        game.getState().actorTalking = -1;
    }
    hero.props.dirMode = ActorDirMode.MANUAL;

    workspace.actor.scripts.life = lifeScript;
    workspace.actor.scripts.move = moveScript;
    compileScripts(DebugData.scope.game, workspace.scene, workspace.actor);
    // console.timeEnd(label);
}

function compileRootBlocks(type, topBlocks, rootTypes) {
    const sortField = type === 'life'
        ? 'data'
        : 'index';
    const rootBlocks = filter(topBlocks, b => rootTypes.includes(b.type));
    const sortedBlocks = sortBy(rootBlocks, [sortField]) as any[];
    if (type === 'life'
        && sortedBlocks.length > 0
        && sortedBlocks[0].type !== 'lba_behaviour_init') {
        return compileBlocks([], 'life');
    }
    return compileBlocks(sortedBlocks, type);
}

function compileBlocks(blocks, type) {
    const ctx = {
        commands: [],
        switchOperandDefs: [],
        orCmds: [],
        andCmds: [],
        lastCase: null,
        breakCmds: [],
        comportementMap: {},
        tracksMap: {},
        inRootTrack: false
    };
    each(blocks, block => compileBlock(block, type, ctx));
    ctx.commands.push({
        op: type === 'life'
            ? getLifeOpcode(0)
            : getMoveOpcode(0)
    });
    return {
        type,
        commands: ctx.commands,
        comportementMap: ctx.comportementMap,
        tracksMap: ctx.tracksMap
    };
}

interface Cmd {
    op: any;
    args?: any[];
}

function compileBlock(block, type, ctx) {
    const mappings = type === 'life' ? lifeMappings : moveMappings;
    const mapper = mappings[block.type];
    const info = typeof(mapper) === 'function' ? mapper(block) : mapper;
    if (info) {
        const op = type === 'life'
            ? getLifeOpcode(info.code)
            : getMoveOpcode(info.code);
        const cmd: Cmd = { op };
        const args = mapArgs(block, op, info.args);
        if (args) {
            cmd.args = args;
        }
        let pushCmd = true;
        if (info.details) {
            pushCmd = info.details(block, cmd, ctx);
        }
        if (pushCmd) {
            block.index = ctx.commands.length;
            ctx.commands.push(cmd);
            if (info.content) {
                info.content(block, (child) => {
                    compileBlock(child, type, ctx);
                }, ctx, cmd);
            }
            if ('closeCode' in info) {
                const closeOp = type === 'life'
                    ? getLifeOpcode(info.closeCode)
                    : getMoveOpcode(info.closeCode);
                ctx.commands.push({
                    op: closeOp
                });
            }
        }
    }
}

function mapArgs(block, op, argsMapping = {}) {
    if (!op.args || op.args.length === 0) {
        return null;
    }
    let idxOffset = 0;
    return map(op.args, (arg, index: number) => {
        const [t, type] = arg.split(':');
        const hide = t[0] === '_';
        let field = block.getField(`arg_${index + idxOffset}`);
        if (type === 'actor' && index === 0 && block.getField('actor')) {
            field = block.getField('actor');
            idxOffset = -1;
        }
        let value = field && field.getValue();
        value = mapValue(value, type);
        if (index in argsMapping) {
            const argm = argsMapping[index];
            if (typeof(argm) === 'function') {
                value = argm(block, value);
            } else {
                value = argsMapping[index];
            }
        }
        return { type, value, hide };
    });
}

function postProcess(script, scene, moveScript = null) {
    const comportementRevMap = mapValues(invert(script.comportementMap), Number);
    const otherScriptTracksRevMap = moveScript && mapValues(invert(moveScript.tracksMap), Number);
    each(script.commands, (cmd) => {
        switch (cmd.op.command) {
            case 'SET_BEHAVIOUR':
                cmd.args[0].value = comportementRevMap[cmd.args[0].value];
                break;
            case 'SET_TRACK':
                cmd.args[0].value = otherScriptTracksRevMap[cmd.args[0].value];
                break;
            case 'SET_BEHAVIOUR_OBJ': {
                const actor = scene.actors[cmd.args[0].value];
                const comportement = cmd.args[1].value;
                const loc = findKey(actor.scripts.life.comportementMap, c => c === comportement);
                cmd.args[1].value = Number(loc);
                break;
            }
            case 'SET_TRACK_OBJ': {
                const actor = scene.actors[cmd.args[0].value];
                const track = cmd.args[1].value;
                const loc = findKey(actor.scripts.move.tracksMap, c => c === track);
                cmd.args[1].value = Number(loc);
                break;
            }
            case 'GOTO': {
                const track = Number(cmd.args[0].value);
                const loc = findKey(script.tracksMap, c => c === track);
                cmd.args[0].value = Number(loc);
                break;
            }
        }
    });
}
