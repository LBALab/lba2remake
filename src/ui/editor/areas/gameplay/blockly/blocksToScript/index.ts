import { map, filter, each, sortBy } from 'lodash';
import jestDiff from 'jest-diff';
import { LifeOpcode } from '../../../../../../game/scripting/data/life';
import { MoveOpcode } from '../../../../../../game/scripting/data/move';
import lifeMappings from './mappings/life';
import moveMappings from './mappings/move';
import { degreesToLBA } from '../../../../../../utils/lba';

export function compile(workspace) {
    const topBlocks = workspace.getTopBlocks(true);
    const sortedBlocks = sortBy(topBlocks, ['index']);

    const behaviourBlocks = filter(sortedBlocks, b =>
            b.type === 'lba_behaviour' ||
            b.type === 'lba_behaviour_init');
    const commands = compileBlocks(behaviourBlocks, 'life');
    // tslint:disable-next-line: no-console
    console.log(commands);

    const diff = jestDiff(workspace.actor.scripts.life.commands, commands);
    // tslint:disable-next-line: no-console
    console.log(diff);

    // const trackBlocks = filter(sortedBlocks, b => b.scriptType === 'lba_move_track');
    // compileScript(trackBlocks);
}

function compileBlocks(blocks, type) {
    const ctx = {
        commands: [],
        switchOperandDefs: []
    };
    each(blocks, block => compileBlock(block, type, ctx));
    ctx.commands.push({ op: LifeOpcode[0] });
    return ctx.commands;
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
            ctx.commands.push(cmd);
            if (info.content) {
                info.content(block, (child) => {
                    compileBlock(child, type, ctx);
                }, ctx);
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
