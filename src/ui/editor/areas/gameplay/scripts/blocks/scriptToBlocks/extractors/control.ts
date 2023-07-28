import { last, dropRight, each, filter } from 'lodash';
import { newBlock, findLastConnection } from './utils';
import * as conditions from './conditions';
import { lbaToDegrees } from '../../../../../../../../utils/lba';

/*
** IF
*/

export function GENERIC_IF(type, workspace, cmd, ctx) {
    const { connection, logicStack } = ctx;
    const controlBlocks = ctx.controlBlocks || [];
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
        controlBlocks: [...controlBlocks, block],
        logicStack: null
    };
}

export function ELSE(_workspace, _cmd, ctx) {
    const ifBlock = last(ctx.controlBlocks) as any;
    ifBlock.enableElseBlock();
    const elseConnection = ifBlock.getInput('else_statements').connection;
    return {
        connection: elseConnection,
    };
}

export function ENDIF(_workspace, _cmd, ctx) {
    const ifBlock = last(ctx.controlBlocks) as any;
    return {
        controlBlocks: dropRight(ctx.controlBlocks),
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
    const controlBlocks = ctx.controlBlocks || [];
    connection.connect(block.previousConnection);
    const condName = cmd.data.condition.op.command;
    if (condName in conditions) {
        conditions[condName](workspace, cmd, {
            ...ctx,
            connection: block.getInput('condition').connection
        });
    }
    return {
        controlBlocks: [...controlBlocks, block],
        logicStack: null,
        connection: block.getInput('statements').connection,
    };
}

function addCaseOperand(workspace, cmd, { connection }, switchBlock) {
    const { operator } = cmd.data;
    const operandBlock = newBlock(workspace, `lba_operand_${operator.operand.type}`, cmd);

    // Unlike if statements, case statements are separated from the variable that they are testing.
    // This means that we need to pass down some information about that variable in order for the
    // dropdown menus to be able to offer rich selections for the variable.
    const condBlock = switchBlock.getInput('condition').connection.targetBlock();
    const type = operator.operand.type;
    if (type === 'var_value') {
        const scope = condBlock.getFieldValue('scope');
        const param = condBlock.getFieldValue('param');

        operandBlock.data = { scope, param };
    } else if (type === 'anim' || type === 'behaviour' || type === 'track') {
        const actor = condBlock.getFieldValue('actor');

        operandBlock.data = { actor };
    }

    setOperand(cmd, operandBlock);
    operandBlock.outputConnection.connect(connection);
}

export function CASE(workspace, cmd, ctx) {
    const block = newBlock(workspace, 'lba_case', cmd);
    const { controlBlocks, logicStack } = ctx;

    // Note: this may be an if block; nesting of if inside switch is allowed.
    const controlBlock = last(controlBlocks) as any;
    const switchBlock = last(filter(controlBlocks, b => b.type === 'lba_switch'));
    const statements = controlBlock.getInput('statements') || controlBlock.getInput('then_statements');

    let connection = findLastConnection(statements.connection);
    each(logicStack, (logicCmd) => {
        const orBlock = newBlock(workspace, 'lba_or_case', logicCmd);
        addCaseOperand(workspace, logicCmd, { connection: orBlock.getInput('operand').connection },
            switchBlock);
        connection.connect(orBlock.previousConnection);
        connection = orBlock.nextConnection;
    });
    connection.connect(block.previousConnection);
    addCaseOperand(workspace, cmd, { connection: block.getInput('operand').connection },
        switchBlock);

    const statementsInput = block.getInput('statements');
    return {
        connection: statementsInput.connection,
        logicStack: null
    };
}

export function DEFAULT(workspace, cmd, ctx) {
    const block = newBlock(workspace, 'lba_default', cmd);
    const { controlBlocks } = ctx;

    // Note: this may be an if block; nesting of if inside switch is allowed.
    const controlBlock = last(controlBlocks) as any;
    const statements = controlBlock.getInput('statements') || controlBlock.getInput('then_statements');

    const swConnection = findLastConnection(statements.connection);
    swConnection.connect(block.previousConnection);
    const statementsInput = block.getInput('statements');
    return {
        connection: statementsInput.connection
    };
}

export function END_SWITCH(_workspace, _cmd, ctx) {
    // We're assuming control statements are properly nested here...
    const controlBlocks = last(ctx.controlBlocks) as any;
    return {
        controlBlocks: dropRight(ctx.controlBlocks),
        connection: controlBlocks.nextConnection
    };
}

/*
** LOGIC
*/

export function LOGIC_OPERATOR(_workspace, cmd, ctx) {
    const logicStack = ctx.logicStack || [];
    return { logicStack: [...logicStack, cmd] };
}
