import {
    newBlock,
    UNKNOWN_CMD,
    UNKNOWN_CMD_OBJ,
    GENERIC_ACTION,
    GENERIC_ACTION_OBJ
} from './utils';
import { GENERIC_IF, LOGIC_OPERATOR } from './control';

/*
** Behaviours
*/
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

export const SET_COMPORTEMENT = GENERIC_ACTION.bind(null, 'lba_set_behaviour', [
    (value, workspace) => {
        const { comportementMap } = workspace.actor.scripts.life;
        return comportementMap[value];
    }
]);

export const SET_COMPORTEMENT_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_set_behaviour_obj', [
    (actor, value) => {
        const { comportementMap } = actor.scripts.life;
        return comportementMap[value];
    }
]);

export const SAVE_COMPORTEMENT =
    GENERIC_ACTION.bind(null, 'lba_save_behaviour', 0);
export const RESTORE_COMPORTEMENT =
    GENERIC_ACTION.bind(null, 'lba_restore_behaviour', 0);
export const SAVE_COMPORTEMENT_OBJ =
    GENERIC_ACTION_OBJ.bind(null, 'lba_save_behaviour_obj', 0);
export const RESTORE_COMPORTEMENT_OBJ =
    GENERIC_ACTION_OBJ.bind(null, 'lba_restore_behaviour_obj', 0);

/*
** Control
*/
export const IF = GENERIC_IF.bind(null, 'lba_if');
export const SWIF = GENERIC_IF.bind(null, 'lba_swif');
export const ONEIF = GENERIC_IF.bind(null, 'lba_oneif');
export {
    ELSE,
    ENDIF,
    SWITCH,
    CASE,
    DEFAULT,
    END_SWITCH
} from './control';

export const OR_CASE = UNKNOWN_CMD.bind(null, 'or_case');
export const BREAK = GENERIC_ACTION.bind(null, 'lba_break', 0);

/*
** Logic
*/
export const AND_IF = LOGIC_OPERATOR;
export const OR_IF = LOGIC_OPERATOR;

/*
** Tracks
*/
export const SET_TRACK = GENERIC_ACTION.bind(null, 'lba_set_track', [
    (value, workspace) => {
        const { tracksMap } = workspace.actor.scripts.move;
        return tracksMap[value];
    }
]);
export const SET_TRACK_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_set_track_obj', [
    (actor, value) => {
        const { tracksMap } = actor.scripts.move;
        return tracksMap[value];
    }
]);
export const SAVE_CURRENT_TRACK =
    GENERIC_ACTION.bind(null, 'lba_save_current_track', 0);
export const SAVE_CURRENT_TRACK_OBJ =
    GENERIC_ACTION_OBJ.bind(null, 'lba_save_current_track_obj', 0);
export const RESTORE_LAST_TRACK =
    GENERIC_ACTION.bind(null, 'lba_restore_last_track', 0);
export const RESTORE_LAST_TRACK_OBJ =
    GENERIC_ACTION_OBJ.bind(null, 'lba_restore_last_track_obj', 0);
export const VAR_GAME_TO_TRACK =
    GENERIC_ACTION.bind(null, 'lba_vargame_to_track', 1);
export const TRACK_TO_VAR_GAME =
    GENERIC_ACTION.bind(null, 'lba_track_to_vargame', 1);

export const SET_VAR_CUBE = GENERIC_ACTION.bind(null, 'lba_set_varscene', 2);
export const SET_VAR_GAME = GENERIC_ACTION.bind(null, 'lba_set_vargame', 2);
export const ANIM = GENERIC_ACTION.bind(null, 'lba_set_anim', 1);
export const ANIM_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_set_anim_obj', 1);
export const BODY = GENERIC_ACTION.bind(null, 'lba_set_body', 1);
export const BODY_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_set_body_obj', 1);
export const NO_BODY = GENERIC_ACTION.bind(null, 'lba_no_body', 0);

export const MESSAGE = UNKNOWN_CMD.bind(null, 'message');
export const MESSAGE_OBJ = UNKNOWN_CMD_OBJ.bind(null, 'message_obj');
export const MESSAGE_ZOE = UNKNOWN_CMD.bind(null, 'message_zoe');
export const ADD_MESSAGE = UNKNOWN_CMD.bind(null, 'add_message');
export const END_MESSAGE = UNKNOWN_CMD.bind(null, 'end_message');
export const ADD_CHOICE = UNKNOWN_CMD.bind(null, 'add_choice');
export const ASK_CHOICE = UNKNOWN_CMD.bind(null, 'ask_choice');
export const ASK_CHOICE_OBJ = UNKNOWN_CMD_OBJ.bind(null, 'ask_choice_obj');

export const END_LIFE = UNKNOWN_CMD.bind(null, 'end_life');
// export const END = unknownCmd.bind(null, 'end');
export const SUICIDE = UNKNOWN_CMD.bind(null, 'suicide');
export const KILL_OBJ = UNKNOWN_CMD_OBJ.bind(null, 'kill_obj');
export const RETURN = UNKNOWN_CMD.bind(null, 'return');
export const CHANGE_CUBE = UNKNOWN_CMD.bind(null, 'change_cube');
export const THE_END = UNKNOWN_CMD.bind(null, 'the_end');
export const GAME_OVER = UNKNOWN_CMD.bind(null, 'game_over');

export const SET_BEHAVIOUR = UNKNOWN_CMD.bind(null, 'set_behaviour');
export const CINEMA_MODE = UNKNOWN_CMD.bind(null, 'cinema_mode');
export const SET_CAMERA = UNKNOWN_CMD.bind(null, 'set_camera');
export const BETA = UNKNOWN_CMD.bind(null, 'beta');
export const POS_POINT = UNKNOWN_CMD.bind(null, 'pos_point');
export const CAM_FOLLOW = UNKNOWN_CMD.bind(null, 'cam_follow');
export const SET_DIRMODE = UNKNOWN_CMD.bind(null, 'set_dirmode');
export const SAVE_HERO = UNKNOWN_CMD.bind(null, 'save_hero');
export const RESTORE_HERO = UNKNOWN_CMD.bind(null, 'restore_hero');
export const SET_HOLO_POS = UNKNOWN_CMD.bind(null, 'set_holo_pos');
export const SET_DOOR_DOWN = UNKNOWN_CMD.bind(null, 'set_door_down');
export const USE_ONE_LITTLE_KEY = UNKNOWN_CMD.bind(null, 'use_one_little_key');
export const SET_DIRMODE_OBJ = UNKNOWN_CMD_OBJ.bind(null, 'set_dirmode_obj');
export const CAMERA_CENTER = UNKNOWN_CMD.bind(null, 'camera_center');
export const CLR_HOLO_POS = UNKNOWN_CMD.bind(null, 'clr_holo_pos');
export const ADD_VAR_GAME = UNKNOWN_CMD.bind(null, 'add_var_game');
export const FOUND_OBJECT = UNKNOWN_CMD.bind(null, 'found_object');
export const GIVE_BONUS = UNKNOWN_CMD.bind(null, 'give_bonus');
export const SAMPLE = UNKNOWN_CMD.bind(null, 'sample');
export const HIT = UNKNOWN_CMD.bind(null, 'hit');
export const SET_SPRITE = UNKNOWN_CMD.bind(null, 'set_sprite');
export const SET_HIT_ZONE = UNKNOWN_CMD.bind(null, 'set_hit_zone');
export const ADD_VAR_CUBE = UNKNOWN_CMD.bind(null, 'add_var_cube');
export const INVISIBLE = UNKNOWN_CMD.bind(null, 'invisible');
export const SET_ANIM_DIAL = UNKNOWN_CMD.bind(null, 'set_anim_dial');
export const IMPACT_POINT = UNKNOWN_CMD.bind(null, 'impact_point');
export const BALLOON = UNKNOWN_CMD.bind(null, 'balloon');
export const SUB_MONEY = UNKNOWN_CMD.bind(null, 'sub_money');
export const PLAY_MUSIC = UNKNOWN_CMD.bind(null, 'play_music');
export const BACKGROUND = UNKNOWN_CMD.bind(null, 'background');
export const SET_DOOR_RIGHT = UNKNOWN_CMD.bind(null, 'set_door_right');
export const CAN_FALL = UNKNOWN_CMD.bind(null, 'can_fall');
export const BRICK_COL = UNKNOWN_CMD.bind(null, 'brick_col');
export const ADD_MONEY = UNKNOWN_CMD.bind(null, 'add_money');
export const NO_SHOCK = UNKNOWN_CMD.bind(null, 'no_shock');
export const PCX = UNKNOWN_CMD.bind(null, 'pcx');
export const MEMO_SLATE = UNKNOWN_CMD.bind(null, 'memo_slate');
export const SET_GRM = UNKNOWN_CMD.bind(null, 'set_grm');
export const INVERSE_BETA = UNKNOWN_CMD.bind(null, 'inverse_beta');
export const PLAY_VIDEO = UNKNOWN_CMD.bind(null, 'play_video');
export const SET_RAIL = UNKNOWN_CMD.bind(null, 'set_rail');
export const SET_DOOR_UP = UNKNOWN_CMD.bind(null, 'set_door_up');
export const SET_CHANGE_CUBE = UNKNOWN_CMD.bind(null, 'set_change_cube');
export const FADE_TO_PAL = UNKNOWN_CMD.bind(null, 'fade_to_pal');
export const FLOW_POINT = UNKNOWN_CMD.bind(null, 'flow_point');
export const STATE_INVENTORY = UNKNOWN_CMD.bind(null, 'state_inventory');
export const SET_USED_INVENTORY = UNKNOWN_CMD.bind(null, 'set_used_inventory');
export const SHADOW_OBJ = UNKNOWN_CMD_OBJ.bind(null, 'shadow_obj');
export const ADD_LIFE_POINT_OBJ = UNKNOWN_CMD_OBJ.bind(null, 'add_life_point_obj');
export const INC_CLOVER_BOX = UNKNOWN_CMD.bind(null, 'inc_clover_box');
export const ANIM_SET = UNKNOWN_CMD.bind(null, 'anim_set');
export const PCX_MESS_OBJ = UNKNOWN_CMD_OBJ.bind(null, 'pcx_mess_obj');
export const SET_FRAME = UNKNOWN_CMD.bind(null, 'set_frame');
export const SET_MAGIC_LEVEL = UNKNOWN_CMD.bind(null, 'set_magic_level');
export const NEW_SAMPLE = UNKNOWN_CMD.bind(null, 'new_sample');
export const ANIM_TEXTURE = UNKNOWN_CMD.bind(null, 'anim_texture');
export const PARM_SAMPLE = UNKNOWN_CMD.bind(null, 'parm_sample');
export const SET_DOOR_LEFT = UNKNOWN_CMD.bind(null, 'set_door_left');
export const FLOW_OBJ = UNKNOWN_CMD.bind(null, 'flow_obj');
export const OBJ_COL = UNKNOWN_CMD.bind(null, 'obj_col');
export const ECLAIR = UNKNOWN_CMD.bind(null, 'eclair');
export const IMPACT_OBJ = UNKNOWN_CMD_OBJ.bind(null, 'impact_obj');
export const SAMPLE_STOP = UNKNOWN_CMD.bind(null, 'sample_stop');
export const REPEAT_SAMPLE = UNKNOWN_CMD.bind(null, 'repeat_sample');
export const POS_OBJ_AROUND = UNKNOWN_CMD.bind(null, 'pos_obj_around');
export const INIT_BUGGY = UNKNOWN_CMD.bind(null, 'init_buggy');
export const FULL_POINT = UNKNOWN_CMD.bind(null, 'full_point');
export const SET_LIFE_POINT_OBJ = UNKNOWN_CMD_OBJ.bind(null, 'set_life_point_obj');
export const SCALE = UNKNOWN_CMD.bind(null, 'scale');
export const SAMPLE_ALWAYS = UNKNOWN_CMD.bind(null, 'sample_always');
export const SET_ARMOR_OBJ = UNKNOWN_CMD_OBJ.bind(null, 'set_armor_obj');
export const SUB_VAR_GAME = UNKNOWN_CMD.bind(null, 'sub_var_game');
export const POPCORN = UNKNOWN_CMD.bind(null, 'popcorn');
export const SET_ARMOR = UNKNOWN_CMD.bind(null, 'set_armor');
export const SUB_VAR_CUBE = UNKNOWN_CMD.bind(null, 'sub_var_cube');
export const RAIN = UNKNOWN_CMD.bind(null, 'rain');
export const SET_FRAME_3DS = UNKNOWN_CMD.bind(null, 'set_frame_3ds');
export const ESCALATOR = UNKNOWN_CMD.bind(null, 'escalator');
// export const NOP = unknownCmd.bind(null, 'nop');
export const SUB_LIFE_POINT_OBJ = UNKNOWN_CMD_OBJ.bind(null, 'sub_life_point_obj');
export const ACTION = UNKNOWN_CMD.bind(null, 'action');
export const PALETTE = UNKNOWN_CMD.bind(null, 'palette');
