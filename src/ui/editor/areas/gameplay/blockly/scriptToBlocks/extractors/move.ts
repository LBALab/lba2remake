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
    const block = newBlock(workspace, 'lba_move_set_anim', cmd);
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

function unknownCmd(label, workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_unknown_move_cmd', cmd);
    if (connection) {
        connection.connect(block.previousConnection);
    }
    block.setFieldValue(label, 'label');
    return { connection: block.nextConnection };
}

export const WAIT_NUM_DSEC = unknownCmd.bind(null, 'wait_num_dsec');
export const ANGLE = unknownCmd.bind(null, 'angle');
export const REPLACE = unknownCmd.bind(null, 'replace');
export const SAMPLE = unknownCmd.bind(null, 'sample');
export const OPEN_DOWN = unknownCmd.bind(null, 'open_down');
export const WAIT_DOOR = unknownCmd.bind(null, 'wait_door');
export const CLOSE = unknownCmd.bind(null, 'close');
export const BACKGROUND = unknownCmd.bind(null, 'background');
export const SPRITE = unknownCmd.bind(null, 'sprite');
export const WAIT_NUM_SECOND = unknownCmd.bind(null, 'wait_num_second');
export const FACE_HERO = unknownCmd.bind(null, 'face_hero');
export const WAIT_NUM_SECOND_RND = unknownCmd.bind(null, 'wait_num_second_rnd');
export const ANGLE_RND = unknownCmd.bind(null, 'angle_rnd');
export const WAIT_NUM_DECIMAL_RND = unknownCmd.bind(null, 'wait_num_decimal_rnd');
export const WAIT_NUM_ANIM = unknownCmd.bind(null, 'wait_num_anim');
export const GOTO = unknownCmd.bind(null, 'goto');
export const OPEN_RIGHT = unknownCmd.bind(null, 'open_right');
export const BODY = unknownCmd.bind(null, 'body');
export const NO_BODY = unknownCmd.bind(null, 'no_body');
export const SAMPLE_ALWAYS = unknownCmd.bind(null, 'sample_always');
export const SPEED = unknownCmd.bind(null, 'speed');
export const GOTO_POINT_3D = unknownCmd.bind(null, 'goto_point_3d');
export const SAMPLE_STOP = unknownCmd.bind(null, 'sample_stop');
export const BETA = unknownCmd.bind(null, 'beta');
export const GOTO_SYM_POINT = unknownCmd.bind(null, 'goto_sym_point');
export const VOLUME = unknownCmd.bind(null, 'volume');
export const FREQUENCY = unknownCmd.bind(null, 'frequency');
export const OPEN_LEFT = unknownCmd.bind(null, 'open_left');
export const OPEN_UP = unknownCmd.bind(null, 'open_up');
export const INTERVAL = unknownCmd.bind(null, 'interval');
export const REPEAT_SAMPLE = unknownCmd.bind(null, 'repeat_sample');
export const SIMPLE_SAMPLE = unknownCmd.bind(null, 'simple_sample');
export const POS_POINT = unknownCmd.bind(null, 'pos_point');
export const WAIT_ANIM_3DS = unknownCmd.bind(null, 'wait_anim_3ds');
export const START_ANIM_3DS = unknownCmd.bind(null, 'start_anim_3ds');
export const STOP_ANIM_3DS = unknownCmd.bind(null, 'stop_anim_3ds');
export const SET_START_3DS = unknownCmd.bind(null, 'set_start_3ds');
export const SET_END_3DS = unknownCmd.bind(null, 'set_end_3ds');
export const SET_FRAME = unknownCmd.bind(null, 'set_frame');
export const WAIT_FRAME_3DS = unknownCmd.bind(null, 'wait_frame_3ds');
