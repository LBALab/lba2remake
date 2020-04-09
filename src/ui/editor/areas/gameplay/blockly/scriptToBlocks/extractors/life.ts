import { last, dropRight } from 'lodash';
import { newBlock } from './blockUtils';
import * as conditions from './conditions';

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

function logicOperator(_workspace, cmd, ctx) {
    const logicStack = ctx.logicStack || [];
    return { logicStack: [...logicStack, cmd] };
}

function addCondition(workspace, cmd, ctx) {
    const condName = cmd.data.condition.op.command;
    if (condName in conditions) {
        conditions[condName](workspace, cmd, ctx);
    }
}

export const AND_IF = logicOperator;
export const OR_IF = logicOperator;

function genericIF(type, workspace, cmd, ctx) {
    const { connection, logicStack } = ctx;
    const ifBlocks = ctx.ifBlocks || [];
    const block = newBlock(workspace, type, cmd);
    connection.connect(block.previousConnection);
    const condConnection = block.getInput('condition').connection;
    const thenConnection = block.getInput('then_statements').connection;
    const logicCmd = last(logicStack) as any;
    if (logicCmd) {
        const logicType = logicCmd.data.op.command === 'AND_IF'
            ? 'lba_and'
            : 'lba_or';
        const logicBlock = newBlock(workspace, logicType, logicCmd);
        condConnection.connect(logicBlock.outputConnection);
        const left = logicBlock.getInput('left').connection;
        addCondition(workspace, logicCmd, { ...ctx, connection: left });
        const right = logicBlock.getInput('right').connection;
        addCondition(workspace, cmd, { ...ctx, connection: right });
    } else {
        addCondition(workspace, cmd, { ...ctx, connection: condConnection });
    }
    return {
        connection: thenConnection,
        ifBlocks: [...ifBlocks, block],
        logicStack: null
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

export function SWITCH(workspace, cmd, ctx) {
    const { connection } = ctx;
    const block = newBlock(workspace, 'lba_switch', cmd);
    const switchBlocks = ctx.switchBlocks || [];
    connection.connect(block.previousConnection);
    const condName = cmd.data.condition.op.command;
    if (condName in conditions) {
        conditions[condName](workspace, cmd, {
            ...ctx,
            connection: block.getInput('condition').connection
        });
    }
    return {
        switchBlocks: [...switchBlocks, block]
    };
}

export function CASE(_workspace, _cmd, ctx) {
    const { switchBlocks } = ctx;
    const block = last(switchBlocks) as any;
    const { statementsInput } = block.addCase();
    return {
        connection: statementsInput.connection
    };
}

export function END_SWITCH(_workspace, _cmd, ctx) {
    const switchBlocks = last(ctx.switchBlocks) as any;
    return {
        switchBlocks: dropRight(ctx.switchBlocks),
        connection: switchBlocks.nextConnection
    };
}

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
