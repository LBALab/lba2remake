import { newBlock } from './blockUtils';

export function TRACK(workspace, cmd, connection) {
    const type = connection
        ? 'lba_move_track'
        : 'lba_move_track_start';
    const block = newBlock(workspace, type, cmd);
    const nextConnection = block.getInput('next').connection;
    if (connection) {
        connection.connect(block.outputConnection);
    }
    block.setFieldValue(cmd.data.args[0].value, 'num_track');
    return { connection: nextConnection };
}

export function GOTO_POINT(workspace, cmd, connection) {
    const block = newBlock(workspace, 'lba_move_goto_point', cmd);
    const nextConnection = block.getInput('next').connection;
    if (connection) {
        connection.connect(block.outputConnection);
    }
    block.setFieldValue(cmd.data.args[0].value, 'point');
    return { connection: nextConnection };
}

export function ANIM(workspace, cmd, connection) {
    const block = newBlock(workspace, 'lba_move_set_anim', cmd);
    const nextConnection = block.getInput('next').connection;
    if (connection) {
        connection.connect(block.outputConnection);
    }
    return { connection: nextConnection };
}

export function WAIT_ANIM(workspace, cmd, connection) {
    const block = newBlock(workspace, 'lba_move_wait_anim', cmd);
    const nextConnection = block.getInput('next').connection;
    if (connection) {
        connection.connect(block.outputConnection);
    }
    return { connection: nextConnection };
}

export function END(workspace, cmd, connection) {
    if (connection) {
        const block = newBlock(workspace, 'lba_move_stop', cmd);
        connection.connect(block.outputConnection);
    }
    return {};
}

export const STOP = END;
