import { newBlock, GENERIC_ACTION, UNKNOWN_MOVE_CMD } from './utils';

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

export function END(_workspace) {
    return { track: null, connection: null };
}

export const STOP = END;

export const GOTO_POINT = GENERIC_ACTION.bind(null, 'lba_goto_point', 1);
export const ANIM = GENERIC_ACTION.bind(null, 'lba_move_set_anim', 1);
export const WAIT_ANIM = GENERIC_ACTION.bind(null, 'lba_wait_anim', 0);
export const BODY = GENERIC_ACTION.bind(null, 'lba_move_set_body', 1);
export const NO_BODY = GENERIC_ACTION.bind(null, 'lba_move_no_body', 0);
export const WAIT_NUM_SECOND = GENERIC_ACTION.bind(null, 'lba_wait_sec', 1);
export const WAIT_NUM_DSEC = GENERIC_ACTION.bind(null, 'lba_wait_dsec', 1);
export const WAIT_NUM_SECOND_RND = GENERIC_ACTION.bind(null, 'lba_wait_sec_rnd', 1);
export const WAIT_NUM_DECIMAL_RND = GENERIC_ACTION.bind(null, 'lba_wait_dsec_rnd', 1);

export const ANGLE = UNKNOWN_MOVE_CMD.bind(null, 'angle');
export const REPLACE = UNKNOWN_MOVE_CMD.bind(null, 'replace');
export const SAMPLE = UNKNOWN_MOVE_CMD.bind(null, 'sample');
export const OPEN_DOWN = UNKNOWN_MOVE_CMD.bind(null, 'open_down');
export const CLOSE = UNKNOWN_MOVE_CMD.bind(null, 'close');
export const BACKGROUND = UNKNOWN_MOVE_CMD.bind(null, 'background');
export const SPRITE = UNKNOWN_MOVE_CMD.bind(null, 'sprite');
export const FACE_HERO = UNKNOWN_MOVE_CMD.bind(null, 'face_hero');
export const ANGLE_RND = UNKNOWN_MOVE_CMD.bind(null, 'angle_rnd');
export const WAIT_DOOR = UNKNOWN_MOVE_CMD.bind(null, 'wait_door');
export const WAIT_NUM_ANIM = UNKNOWN_MOVE_CMD.bind(null, 'wait_num_anim');
export const GOTO = UNKNOWN_MOVE_CMD.bind(null, 'goto');
export const OPEN_RIGHT = UNKNOWN_MOVE_CMD.bind(null, 'open_right');
export const SAMPLE_ALWAYS = UNKNOWN_MOVE_CMD.bind(null, 'sample_always');
export const SPEED = UNKNOWN_MOVE_CMD.bind(null, 'speed');
export const GOTO_POINT_3D = UNKNOWN_MOVE_CMD.bind(null, 'goto_point_3d');
export const SAMPLE_STOP = UNKNOWN_MOVE_CMD.bind(null, 'sample_stop');
export const BETA = UNKNOWN_MOVE_CMD.bind(null, 'beta');
export const GOTO_SYM_POINT = UNKNOWN_MOVE_CMD.bind(null, 'goto_sym_point');
export const VOLUME = UNKNOWN_MOVE_CMD.bind(null, 'volume');
export const FREQUENCY = UNKNOWN_MOVE_CMD.bind(null, 'frequency');
export const OPEN_LEFT = UNKNOWN_MOVE_CMD.bind(null, 'open_left');
export const OPEN_UP = UNKNOWN_MOVE_CMD.bind(null, 'open_up');
export const INTERVAL = UNKNOWN_MOVE_CMD.bind(null, 'interval');
export const REPEAT_SAMPLE = UNKNOWN_MOVE_CMD.bind(null, 'repeat_sample');
export const SIMPLE_SAMPLE = UNKNOWN_MOVE_CMD.bind(null, 'simple_sample');
export const POS_POINT = UNKNOWN_MOVE_CMD.bind(null, 'pos_point');
export const WAIT_ANIM_3DS = UNKNOWN_MOVE_CMD.bind(null, 'wait_anim_3ds');
export const START_ANIM_3DS = UNKNOWN_MOVE_CMD.bind(null, 'start_anim_3ds');
export const STOP_ANIM_3DS = UNKNOWN_MOVE_CMD.bind(null, 'stop_anim_3ds');
export const SET_START_3DS = UNKNOWN_MOVE_CMD.bind(null, 'set_start_3ds');
export const SET_END_3DS = UNKNOWN_MOVE_CMD.bind(null, 'set_end_3ds');
export const SET_FRAME = UNKNOWN_MOVE_CMD.bind(null, 'set_frame');
export const WAIT_FRAME_3DS = UNKNOWN_MOVE_CMD.bind(null, 'wait_frame_3ds');
