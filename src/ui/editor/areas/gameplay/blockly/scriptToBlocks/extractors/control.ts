import { last, dropRight, each } from 'lodash';
import { newBlock, findLastConnection } from './utils';
import * as conditions from './conditions';
import { lbaToDegrees } from '../../../../../../../utils/lba';

/*
** IF
*/

export function GENERIC_IF(type, workspace, cmd, ctx) {
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
        const arg0 = logicBlock.getInput('arg_0').connection;
        addCondition(workspace, logicCmd, { ...ctx, connection: arg0 });
        const arg1 = logicBlock.getInput('arg_1').connection;
        addCondition(workspace, cmd, { ...ctx, connection: arg1 });
    } else {
        addCondition(workspace, cmd, { ...ctx, connection: condConnection });
    }
    return {
        connection: thenConnection,
        ifBlocks: [...ifBlocks, block],
        logicStack: null
    };
}

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

function setOperand(cmd, opBlock) {
    const { operator } = cmd.data;
    if (opBlock.getField('operator')) {
        opBlock.setFieldValue(operator.op.command, 'operator');
    }
    if (opBlock.type === 'lba_cur_track' || opBlock.type === 'lba_operand_track') {
        return;
    }
    if (opBlock.getField('operand')) {
        let value = operator.operand.value;
        if (operator.operand.type === 'angle') {
            value = lbaToDegrees(value);
        }
        opBlock.setFieldValue(value, 'operand');
    }
}

function addCondition(workspace, cmd, ctx) {
    const condName = cmd.data.condition.op.command;
    if (condName in conditions) {
        const condBlock = conditions[condName](workspace, cmd, ctx);
        setOperand(cmd, condBlock);
    }
}

/*
** SWITCH
*/

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
        switchBlocks: [...switchBlocks, block],
        logicStack: null
    };
}

function addCaseOperand(workspace, cmd, { connection }) {
    const { operator } = cmd.data;
    const operandBlock = newBlock(workspace, `lba_operand_${operator.operand.type}`, cmd);
    setOperand(cmd, operandBlock);
    operandBlock.outputConnection.connect(connection);
}

export function CASE(workspace, cmd, ctx) {
    const block = newBlock(workspace, 'lba_case', cmd);
    const { switchBlocks, logicStack } = ctx;
    const swBlock = last(switchBlocks) as any;
    let connection = findLastConnection(swBlock.getInput('statements').connection);
    each(logicStack, (logicCmd) => {
        const orBlock = newBlock(workspace, 'lba_or_case', logicCmd);
        addCaseOperand(workspace, logicCmd, { connection: orBlock.getInput('operand').connection });
        connection.connect(orBlock.previousConnection);
        connection = orBlock.nextConnection;
    });
    connection.connect(block.previousConnection);
    addCaseOperand(workspace, cmd, { connection: block.getInput('operand').connection });

    const statementsInput = block.getInput('statements');
    return {
        connection: statementsInput.connection,
        logicStack: null
    };
}

export function DEFAULT(workspace, cmd, ctx) {
    const block = newBlock(workspace, 'lba_default', cmd);
    const { switchBlocks } = ctx;
    const swBlock = last(switchBlocks) as any;
    const swConnection = findLastConnection(swBlock.getInput('statements').connection);
    swConnection.connect(block.previousConnection);
    const statementsInput = block.getInput('statements');
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

/*
** LOGIC
*/

export function LOGIC_OPERATOR(_workspace, cmd, ctx) {
    const logicStack = ctx.logicStack || [];
    return { logicStack: [...logicStack, cmd] };
}
