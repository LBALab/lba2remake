import { map, filter, each, sortBy, invert, mapValues, findKey } from 'lodash';
// import jestDiff from 'jest-diff';
import { LifeOpcode } from '../../../../../../game/scripting/data/life';
import { MoveOpcode } from '../../../../../../game/scripting/data/move';
import lifeMappings from './mappings/life';
import moveMappings from './mappings/move';
import { degreesToLBA } from '../../../../../../utils/lba';
import { compileScripts } from '../../../../../../scripting/compiler';
import DebugData from '../../../../DebugData';

export function compile(workspace) {
    const topBlocks = workspace.getTopBlocks(true);
    const sortedBlocks = sortBy(topBlocks, ['index']);

    const behaviourBlocks = filter(sortedBlocks, b =>
            b.type === 'lba_behaviour' ||
            b.type === 'lba_behaviour_init');
    const script = compileBlocks(behaviourBlocks, 'life');
    postProcess(script, workspace.actor.scripts.move, workspace.scene);
    workspace.actor.scripts.life = script;

    // console.log(script);
    // const diff = jestDiff(workspace.actor.scripts.life.commands, script.commands);
    // console.log(diff);

    // const trackBlocks = filter(sortedBlocks, b => b.scriptType === 'lba_move_track');
    // compileBlocks(trackBlocks, 'move');
    compileScripts(DebugData.scope.game, workspace.scene, workspace.actor);
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
        tracksMap: {}
    };
    each(blocks, block => compileBlock(block, type, ctx));
    ctx.commands.push({
        op: type === 'life'
            ? LifeOpcode[0]
            : MoveOpcode[0]
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
    const info = mappings[block.type];
    if (info) {
        const op = type === 'life'
            ? LifeOpcode[info.code]
            : MoveOpcode[info.code];
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
                    ? LifeOpcode[info.closeCode]
                    : MoveOpcode[info.closeCode];
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
        if (type === 'angle') {
            value = degreesToLBA(value);
        }
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

function postProcess(script, moveScript, scene) {
    const comportementRevMap = mapValues(invert(script.comportementMap), Number);
    const otherScriptTracksRevMap = mapValues(invert(moveScript.tracksMap), Number);
    each(script.commands, (cmd) => {
        switch (cmd.op.command) {
            case 'SET_COMPORTEMENT':
                cmd.args[0].value = comportementRevMap[cmd.args[0].value];
                break;
            case 'SET_TRACK':
                cmd.args[0].value = otherScriptTracksRevMap[cmd.args[0].value];
                break;
            case 'SET_COMPORTEMENT_OBJ': {
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
        }
    });
}
