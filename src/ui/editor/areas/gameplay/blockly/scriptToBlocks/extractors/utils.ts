export function newBlock(workspace, type, def) {
    const block = workspace.newBlock(type);
    block.index = def.index;
    block.scriptType = def.type;
    block.initSvg();
    block.render();
    return block;
}

export function GENERIC_ACTION(type, argCount, workspace, cmd, {connection}) {
    const block = newBlock(workspace, type, cmd);
    connection.connect(block.previousConnection);
    for (let i = 0; i < argCount; i += 1) {
        block.setFieldValue(cmd.data.args[i].value, `arg_${i}`);
    }
    return { connection: block.nextConnection };
}

export function GENERIC_ACTION_OBJ(type, argCount, workspace, cmd, {connection}) {
    const block = newBlock(workspace, type, cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'actor');
    for (let i = 1; i < argCount + 1; i += 1) {
        block.setFieldValue(cmd.data.args[i].value, `arg_${i - 1}`);
    }
    return { connection: block.nextConnection };
}

export function GENERIC_CONDITION(type, workspace, cmd, { connection }) {
    const block = newBlock(workspace, type, cmd);
    connection.connect(block.outputConnection);
}

export function GENERIC_CONDITION_OBJ(type, workspace, cmd, { connection }) {
    const block = newBlock(workspace, type, cmd);
    const cond = cmd.data.condition;
    block.setFieldValue(cond.param.value, 'param');
    connection.connect(block.outputConnection);
}

export function UNKNOWN_CMD(label, workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_unknown_life_cmd', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(label, 'label');
    return { connection: block.nextConnection };
}

export function UNKNOWN_CMD_OBJ(label, workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_unknown_life_cmd_obj', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(label, 'label');
    return { connection: block.nextConnection };
}

export function UNKNOWN_CONDITION(label, workspace, cmd, { connection }) {
    const block = newBlock(workspace, 'lba_unknown_cond', cmd);
    block.setFieldValue(label, 'label');
    connection.connect(block.outputConnection);
}

export function UNKNOWN_MOVE_CMD(label, workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_unknown_move_cmd', cmd);
    if (connection) {
        connection.connect(block.previousConnection);
    }
    block.setFieldValue(label, 'label');
    return { connection: block.nextConnection };
}
