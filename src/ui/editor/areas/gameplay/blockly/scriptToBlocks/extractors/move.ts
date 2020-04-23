import { newBlock, GENERIC_ACTION } from './utils';

export function TRACK(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_move_track', cmd);
    if (connection) {
        connection.connect(block.previousConnection);
    }
    block.setFieldValue(cmd.data.args[0].value, 'arg_0');
    return {
        connection: block.nextConnection,
        track: block,
    };
}

export const GOTO = GENERIC_ACTION.bind(null, 'lba_move_goto', 0);

export function END(_workspace) {
    return { track: null, connection: null };
}

export const STOP = END;

export const GOTO_POINT = GENERIC_ACTION.bind(null, 'lba_move_goto_point', 1);
export const ANIM = GENERIC_ACTION.bind(null, 'lba_move_set_anim', 1);
export const WAIT_ANIM = GENERIC_ACTION.bind(null, 'lba_move_wait_anim', 0);
export const BODY = GENERIC_ACTION.bind(null, 'lba_move_set_body', 1);
export const NO_BODY = GENERIC_ACTION.bind(null, 'lba_move_no_body', 0);
export const WAIT_NUM_SECOND = GENERIC_ACTION.bind(null, 'lba_move_wait_sec', 1);
export const WAIT_NUM_DSEC = GENERIC_ACTION.bind(null, 'lba_move_wait_dsec', 1);
export const WAIT_NUM_SECOND_RND = GENERIC_ACTION.bind(null, 'lba_move_wait_sec_rnd', 1);
export const WAIT_NUM_DECIMAL_RND = GENERIC_ACTION.bind(null, 'lba_move_wait_dsec_rnd', 1);

export const ANGLE = GENERIC_ACTION.bind(null, 'lba_move_set_angle', 1);
export const ANGLE_RND = GENERIC_ACTION.bind(null, 'lba_move_set_angle_rnd', 2);
export const BETA = GENERIC_ACTION.bind(null, 'lba_move_set_orientation', 1);
export const REPLACE = GENERIC_ACTION.bind(null, 'lba_move_replace', 0);
export const SAMPLE = GENERIC_ACTION.bind(null, 'lba_move_sample', 1);
export const OPEN_LEFT = GENERIC_ACTION.bind(null, 'lba_move_open_left', 1);
export const OPEN_RIGHT = GENERIC_ACTION.bind(null, 'lba_move_open_right', 1);
export const OPEN_UP = GENERIC_ACTION.bind(null, 'lba_move_open_up', 1);
export const OPEN_DOWN = GENERIC_ACTION.bind(null, 'lba_move_open_down', 1);
export const CLOSE = GENERIC_ACTION.bind(null, 'lba_move_close', 0);
export const BACKGROUND = GENERIC_ACTION.bind(null, 'lba_move_background', 1);
export const SPRITE = GENERIC_ACTION.bind(null, 'lba_move_set_sprite', 1);
export const FACE_HERO = GENERIC_ACTION.bind(null, 'lba_move_face_hero', 1);
export const WAIT_DOOR = GENERIC_ACTION.bind(null, 'lba_move_wait_door', 0);
export const WAIT_NUM_ANIM = GENERIC_ACTION.bind(null, 'lba_move_wait_num_anim', 0);
export const SAMPLE_ALWAYS = GENERIC_ACTION.bind(null, 'lba_move_sample_always', 1);
export const SPEED = GENERIC_ACTION.bind(null, 'lba_move_speed', 1);
export const GOTO_POINT_3D = GENERIC_ACTION.bind(null, 'lba_move_goto_point_3d', 1);
export const SAMPLE_STOP = GENERIC_ACTION.bind(null, 'lba_move_sample_stop', 1);
export const GOTO_SYM_POINT = GENERIC_ACTION.bind(null, 'lba_move_goto_sym_point', 1);
export const VOLUME = GENERIC_ACTION.bind(null, 'lba_move_volume', 1);
export const FREQUENCY = GENERIC_ACTION.bind(null, 'lba_move_frequency', 1);
export const INTERVAL = GENERIC_ACTION.bind(null, 'lba_move_interval', 1);
export const REPEAT_SAMPLE = GENERIC_ACTION.bind(null, 'lba_move_repeat_sample', 1);
export const SIMPLE_SAMPLE = GENERIC_ACTION.bind(null, 'lba_move_simple_sample', 1);
export const POS_POINT = GENERIC_ACTION.bind(null, 'lba_move_pos_point', 1);
export const WAIT_ANIM_3DS = GENERIC_ACTION.bind(null, 'lba_move_wait_anim_3ds', 1);
export const START_ANIM_3DS = GENERIC_ACTION.bind(null, 'lba_move_start_anim_3ds', 0);
export const STOP_ANIM_3DS = GENERIC_ACTION.bind(null, 'lba_move_stop_anim_3ds', 0);
export const SET_START_3DS = GENERIC_ACTION.bind(null, 'lba_move_set_start_3ds', 1);
export const SET_END_3DS = GENERIC_ACTION.bind(null, 'lba_move_set_end_3ds', 1);
export const SET_FRAME = GENERIC_ACTION.bind(null, 'lba_move_set_frame', 1);
export const SET_FRAME_3DS = GENERIC_ACTION.bind(null, 'lba_move_set_frame_3ds', 1);
export const WAIT_FRAME_3DS = GENERIC_ACTION.bind(null, 'lba_move_wait_frame_3ds', 1);
