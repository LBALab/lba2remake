import {
    newBlock,
    GENERIC_ACTION,
    GENERIC_ACTION_OBJ
} from './utils';
import { GENERIC_IF, LOGIC_OPERATOR } from './control';
import { getRotation } from '../../../../../../../utils/lba';

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

export const BREAK = GENERIC_ACTION.bind(null, 'lba_break', 0);

/*
** Logic
*/
export const AND_IF = LOGIC_OPERATOR;
export const OR_IF = LOGIC_OPERATOR;
export const OR_CASE = LOGIC_OPERATOR;

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

export function SET_DIRMODE(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_dirmode', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'arg_0');
    return { connection: block.nextConnection };
}

export function SET_DIRMODE_OBJ(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_dirmode_obj', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'actor');
    block.setFieldValue(cmd.data.args[1].value, 'arg_0');
    return { connection: block.nextConnection };
}

export const END_LIFE = GENERIC_ACTION.bind(null, 'lba_end_life', 0);
export const SUICIDE = GENERIC_ACTION.bind(null, 'lba_suicide', 0);
export const KILL_OBJ = GENERIC_ACTION.bind(null, 'lba_kill_obj', 1);
export const RETURN = GENERIC_ACTION.bind(null, 'lba_return', 0);
export const CHANGE_CUBE = GENERIC_ACTION.bind(null, 'lba_change_scene', 1);
export const THE_END = GENERIC_ACTION.bind(null, 'lba_the_end', 0);
export const GAME_OVER = GENERIC_ACTION.bind(null, 'lba_game_over', 0);

export const SET_VAR_CUBE = GENERIC_ACTION.bind(null, 'lba_set_varscene', 2);
export const SET_VAR_GAME = GENERIC_ACTION.bind(null, 'lba_set_vargame', 2);

export const ANIM = GENERIC_ACTION.bind(null, 'lba_set_anim', 1);
export const ANIM_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_set_anim_obj', 1);
export const BODY = GENERIC_ACTION.bind(null, 'lba_set_body', 1);
export const BODY_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_set_body_obj', 1);
export const NO_BODY = GENERIC_ACTION.bind(null, 'lba_no_body', 0);

export const MESSAGE = GENERIC_ACTION.bind(null, 'lba_message', 1);
export const MESSAGE_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_message_obj', 1);
export const MESSAGE_ZOE = GENERIC_ACTION.bind(null, 'lba_message_zoe', 1);
export const ADD_MESSAGE = GENERIC_ACTION.bind(null, 'lba_add_message', 1);
export const END_MESSAGE = GENERIC_ACTION.bind(null, 'lba_end_message', 0);
export const ADD_CHOICE = GENERIC_ACTION.bind(null, 'lba_add_choice', 1);
export const ASK_CHOICE = GENERIC_ACTION.bind(null, 'lba_ask_choice', 1);
export const ASK_CHOICE_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_ask_choice_obj', 1);

export const ADD_VAR_GAME = GENERIC_ACTION.bind(null, 'lba_add_vargame', 2);
export const SUB_VAR_GAME = GENERIC_ACTION.bind(null, 'lba_sub_vargame', 2);
export const ADD_VAR_CUBE = GENERIC_ACTION.bind(null, 'lba_add_varcube', 2);
export const SUB_VAR_CUBE = GENERIC_ACTION.bind(null, 'lba_sub_varcube', 2);

export const SET_BEHAVIOUR = GENERIC_ACTION.bind(null, 'lba_set_hero_behaviour', 1);
export const SAVE_HERO = GENERIC_ACTION.bind(null, 'lba_save_hero', 0);
export const RESTORE_HERO = GENERIC_ACTION.bind(null, 'lba_restore_hero', 0);
export const SET_MAGIC_LEVEL = GENERIC_ACTION.bind(null, 'lba_set_magic_level', 1);

export const CINEMA_MODE = GENERIC_ACTION.bind(null, 'lba_cinema_mode', 1);
export const SET_CAMERA = GENERIC_ACTION.bind(null, 'lba_set_camera', 1);
export const CAMERA_CENTER = GENERIC_ACTION.bind(null, 'lba_camera_center', 1);
export const CAM_FOLLOW = GENERIC_ACTION.bind(null, 'lba_cam_follow', 1);

export const POS_POINT = GENERIC_ACTION.bind(null, 'lba_set_position', 1);
export const BETA = GENERIC_ACTION.bind(null, 'lba_set_orientation', [
    (value) => {
        return Math.round(getRotation(value, 0, 1) - 90);
    }
]);
export const INVERSE_BETA = GENERIC_ACTION.bind(null, 'lba_set_inverse_orientation', [
    (value) => {
        return Math.round(getRotation(value, 0, 1) - 90);
    }
]);

export const SET_DOOR_LEFT = GENERIC_ACTION.bind(null, 'lba_set_door_left', 1);
export const SET_DOOR_RIGHT = GENERIC_ACTION.bind(null, 'lba_set_door_right', 1);
export const SET_DOOR_UP = GENERIC_ACTION.bind(null, 'lba_set_door_up', 1);
export const SET_DOOR_DOWN = GENERIC_ACTION.bind(null, 'lba_set_door_down', 1);

export const SET_LIFE_POINT_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_set_life_point_obj', 1);
export const ADD_LIFE_POINT_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_add_life_point_obj', 1);
export const SUB_LIFE_POINT_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_sub_life_point_obj', 1);
export const FULL_POINT = GENERIC_ACTION.bind(null, 'lba_full_point', 0);
export const SET_ARMOR = GENERIC_ACTION.bind(null, 'lba_set_armor', 1);
export const SET_ARMOR_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_set_armor_obj', 1);

export const ADD_MONEY = GENERIC_ACTION.bind(null, 'lba_add_money', 1);
export const SUB_MONEY = GENERIC_ACTION.bind(null, 'lba_sub_money', 1);
export const USE_ONE_LITTLE_KEY = GENERIC_ACTION.bind(null, 'lba_use_one_little_key', 0);
export const GIVE_BONUS = GENERIC_ACTION.bind(null, 'lba_give_bonus', 1);
export const INC_CLOVER_BOX = GENERIC_ACTION.bind(null, 'lba_inc_clover_box', 0);

export const FOUND_OBJECT = GENERIC_ACTION.bind(null, 'lba_found_object', 1);
export const STATE_INVENTORY = GENERIC_ACTION.bind(null, 'lba_state_inventory', 2);
export const SET_USED_INVENTORY = GENERIC_ACTION.bind(null, 'lba_set_used_inventory', 1);
export const SET_HOLO_POS = GENERIC_ACTION.bind(null, 'lba_set_holo_pos', 1);
export const CLR_HOLO_POS = GENERIC_ACTION.bind(null, 'lba_clr_holo_pos', 1);
export const MEMO_SLATE = GENERIC_ACTION.bind(null, 'lba_memo_slate', 1);

export const SAMPLE = GENERIC_ACTION.bind(null, 'lba_sample', 1);
export const NEW_SAMPLE = GENERIC_ACTION.bind(null, 'lba_new_sample', 4);
export const REPEAT_SAMPLE = GENERIC_ACTION.bind(null, 'lba_repeat_sample', 2);
export const SAMPLE_ALWAYS = GENERIC_ACTION.bind(null, 'lba_sample_always', 1);
export const SAMPLE_STOP = GENERIC_ACTION.bind(null, 'lba_sample_stop', 1);
export const PARM_SAMPLE = GENERIC_ACTION.bind(null, 'lba_parm_sample', 3);
export const PLAY_MUSIC = GENERIC_ACTION.bind(null, 'lba_play_music', 1);

export const PLAY_VIDEO = GENERIC_ACTION.bind(null, 'lba_play_video', 1);

export const HIT = GENERIC_ACTION.bind(null, 'lba_hit', 2);
export const SET_HIT_ZONE = GENERIC_ACTION.bind(null, 'lba_set_hit_zone', 2);

export const SET_SPRITE = GENERIC_ACTION.bind(null, 'lba_set_sprite', 1);
export const ANIM_TEXTURE = GENERIC_ACTION.bind(null, 'lba_anim_texture', 1);

export const INVISIBLE = GENERIC_ACTION.bind(null, 'lba_set_invisible', 1);

export const SET_RAIL = GENERIC_ACTION.bind(null, 'lba_set_rail', 2);
export const ESCALATOR = GENERIC_ACTION.bind(null, 'lba_escalator', 2);
export const INIT_BUGGY = GENERIC_ACTION.bind(null, 'lba_init_buggy', 1);

export const RAIN = GENERIC_ACTION.bind(null, 'lba_rain', 1);
export const ECLAIR = GENERIC_ACTION.bind(null, 'lba_lightning', 1);

export const SET_ANIM_DIAL = GENERIC_ACTION.bind(null, 'lba_set_anim_dial', 1);
export const IMPACT_POINT = GENERIC_ACTION.bind(null, 'lba_impact_point', 2);
export const BALLOON = GENERIC_ACTION.bind(null, 'lba_balloon', 1);
export const BACKGROUND = GENERIC_ACTION.bind(null, 'lba_background', 1);
export const CAN_FALL = GENERIC_ACTION.bind(null, 'lba_set_can_fall', 1);
export const BRICK_COL = GENERIC_ACTION.bind(null, 'lba_brick_col', 1);
export const OBJ_COL = GENERIC_ACTION.bind(null, 'lba_obj_col', 1);
export const NO_SHOCK = GENERIC_ACTION.bind(null, 'lba_no_shock', 1);
export const PCX = GENERIC_ACTION.bind(null, 'lba_pcx', 1);
export const SET_GRM = GENERIC_ACTION.bind(null, 'lba_set_grm', 2);
export const SET_CHANGE_CUBE = GENERIC_ACTION.bind(null, 'lba_set_change_cube', 2);
export const FADE_TO_PAL = GENERIC_ACTION.bind(null, 'lba_fade_to_pal', 1);
export const PALETTE = GENERIC_ACTION.bind(null, 'lba_palette', 1);
export const FLOW_POINT = GENERIC_ACTION.bind(null, 'lba_flow_point', 2);
export const SHADOW_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_shadow_obj', 2);
export const ANIM_SET = GENERIC_ACTION.bind(null, 'lba_anim_set', 1);
export const PCX_MESS_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_pcx_mess_obj', 2);
export const SET_FRAME = GENERIC_ACTION.bind(null, 'lba_set_frame', 1);
export const FLOW_OBJ = GENERIC_ACTION.bind(null, 'lba_flow_obj', 1);
export const IMPACT_OBJ = GENERIC_ACTION_OBJ.bind(null, 'lba_impact_obj', 2);
export const POS_OBJ_AROUND = GENERIC_ACTION.bind(null, 'lba_pos_obj_around', 2);
export const SCALE = GENERIC_ACTION.bind(null, 'lba_scale', 2);
export const POPCORN = GENERIC_ACTION.bind(null, 'lba_popcorn', 0);
export const SET_FRAME_3DS = GENERIC_ACTION.bind(null, 'lba_set_frame_3ds', 1);
export const ACTION = GENERIC_ACTION.bind(null, 'lba_set_action', 0);
