import { last, dropRight } from 'lodash';
import { newBlock } from './blockUtils';

export function COMPORTEMENT(workspace, cmd, _ctx) {
    const num = cmd.data.section;
    const type = num === 1
        ? 'lba_behaviour_init'
        : 'lba_behaviour';
    const block = newBlock(workspace, type, cmd);
    if (num === 2) {
        block.setFieldValue('NORMAL', 'name');
    } else if (num > 2) {
        block.setFieldValue(`BEHAVIOUR ${num}`, 'name');
    }
    const statementsConnection = block.getInput('statements').connection;
    return {
        connection: statementsConnection,
    };
}

function genericIF(type, workspace, cmd, ctx) {
    const { connection } = ctx;
    const ifBlocks = ctx.ifBlocks || [];
    const block = newBlock(workspace, type, cmd);
    connection.connect(block.previousConnection);
    const thenConnection = block.getInput('then_statements').connection;
    return {
        connection: thenConnection,
        ifBlocks: [...ifBlocks, block]
    };
}

export const IF = genericIF.bind(null, 'lba_if');
export const SWIF = genericIF.bind(null, 'lba_swif');
export const ONEIF = genericIF.bind(null, 'lba_oneif');

export function ELSE(_workspace, _cmd, ctx) {
    const ifBlock = last(ctx.ifBlocks) as any;
    ifBlock.enableElseBlock();
    const elseConnection = ifBlock.getInput('else_statements').connection;
    return {
        connection: elseConnection,
    };
}

export function ENDIF(_workspace, _cmd, ctx) {
    const ifBlock = last(ctx.ifBlocks) as any;
    return {
        ifBlocks: dropRight(ctx.ifBlocks),
        connection: ifBlock.nextConnection
    };
}

export const IF = IF_GENERIC.bind(null, 'lba_if');
export const SWIF = IF_GENERIC.bind(null, 'lba_swif');
export const ONEIF = IF_GENERIC.bind(null, 'lba_oneif');

export function SET_COMPORTEMENT(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_behaviour', cmd);
    connection.connect(block.previousConnection);
    const { comportementMap } = workspace.actor.scripts.life;
    const value = comportementMap[cmd.data.args[0].value];
    block.setFieldValue(`${value}`, 'arg_0');
    return { connection: block.nextConnection };
}

export function SET_COMPORTEMENT_OBJ(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_behaviour_obj', cmd);
    block.actor = workspace.scene.actors[cmd.data.args[0].value];
    block.setFieldValue(`${cmd.data.args[0].value}`, 'actor');
    const { comportementMap } = workspace.scene.actors[cmd.data.args[0].value].scripts.life;
    const value = comportementMap[cmd.data.args[1].value];
    block.setFieldValue(`${value}`, 'arg_0');
    connection.connect(block.previousConnection);
    return { connection: block.nextConnection };
}

export function SET_VAR_CUBE(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_varscene', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'arg_0');
    block.setFieldValue(cmd.data.args[1].value, 'arg_1');
    return { connection: block.nextConnection };
}

export function SET_VAR_GAME(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_vargame', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'arg_0');
    block.setFieldValue(cmd.data.args[1].value, 'arg_1');
    return { connection: block.nextConnection };
}

export function ANIM(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_anim', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'arg_0');
    return { connection: block.nextConnection };
}

export function ANIM_OBJ(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_anim_obj', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'arg_0');
    return { connection: block.nextConnection };
}
