import { newBlock } from './blockUtils';

export function TRACK(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_track', cmd);
    if (connection) {
        connection.connect(block.previousConnection);
    }
    block.setFieldValue(cmd.data.args[0].value, 'arg_0');
    return {
        connection: block.nextConnection,
        track: block,
    };
}

export function GOTO_POINT(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_goto_point', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'arg_0');
    return { connection: block.nextConnection };
}

export function ANIM(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_anim', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'arg_0');
    return { connection: block.nextConnection };
}

export function WAIT_ANIM(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_wait_anim', cmd);
    connection.connect(block.previousConnection);
    return { connection: block.nextConnection };
}

export function END(_workspace) {
    return { track: null, connection: null };
}

export const STOP = END;
