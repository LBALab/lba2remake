import { lbaToDegrees } from '../../../../../../../../utils/lba';

export function newBlock(workspace, type, def) {
    const block = workspace.newBlock(type);
    block.index = def.index;
    block.initSvg();
    block.render();
    return block;
}

export function findLastConnection(connection) {
    let lastConnection = connection;
    while (lastConnection.targetBlock()) {
        lastConnection = lastConnection.targetBlock().nextConnection;
    }
    return lastConnection;
}

export function mapArgValue(cmd, idx) {
    let value = cmd.data.args[idx].value;
    const type = cmd.data.op.args[idx].split(':')[1];
    switch (type) {
        case 'angle':
            value = lbaToDegrees(value);
            break;
    }
    return value;
}

export function GENERIC_ACTION(type, arg, workspace, cmd, {connection}) {
    const block = newBlock(workspace, type, cmd);
    if (connection) {
        connection.connect(block.previousConnection);
    }
    if (Array.isArray(arg)) {
        for (let i = 0; i < arg.length; i += 1) {
            block.setFieldValue(arg[i](cmd.data.args[i].value, workspace, cmd), `arg_${i}`);
        }
    } else {
        for (let i = 0; i < arg; i += 1) {
            block.setFieldValue(mapArgValue(cmd, i), `arg_${i}`);
        }
    }
    return { connection: block.nextConnection };
}

export function GENERIC_ACTION_OBJ(type, arg, workspace, cmd, {connection}) {
    const actor = workspace.scene.actors[cmd.data.args[0].value];
    const block = newBlock(workspace, type, cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'actor');
    if (Array.isArray(arg)) {
        for (let i = 1; i < arg.length + 1; i += 1) {
            // tslint:disable-next-line: max-line-length
            block.setFieldValue(arg[i - 1](actor, cmd.data.args[i].value, workspace, cmd), `arg_${i - 1}`);
        }
    } else {
        for (let i = 1; i < arg + 1; i += 1) {
            block.setFieldValue(mapArgValue(cmd, i), `arg_${i - 1}`);
        }
    }
    return { connection: block.nextConnection };
}

export function GENERIC_CONDITION(type, param, workspace, cmd, { connection }) {
    const block = newBlock(workspace, type, cmd);
    if (param) {
        const cond = cmd.data.condition;
        if (block.getField('actor')) {
            block.setFieldValue(cond.param.value, 'actor');
        } else {
            block.setFieldValue(cond.param.value, 'param');
        }
    }
    connection.connect(block.outputConnection);
    return block;
}
