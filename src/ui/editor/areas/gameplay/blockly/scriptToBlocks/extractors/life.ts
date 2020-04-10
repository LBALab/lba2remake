import { last, dropRight } from 'lodash';
import { newBlock } from './blockUtils';
import * as conditions from './conditions';

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

function logicOperator(_workspace, cmd, ctx) {
    const logicStack = ctx.logicStack || [];
    return { logicStack: [...logicStack, cmd] };
}

function addCondition(workspace, cmd, ctx) {
    const condName = cmd.data.condition.op.command;
    if (condName in conditions) {
        conditions[condName](workspace, cmd, ctx);
    }
}

export const AND_IF = logicOperator;
export const OR_IF = logicOperator;

function genericIF(type, workspace, cmd, ctx) {
    const { connection, logicStack } = ctx;
    const ifBlocks = ctx.ifBlocks || [];
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
        const left = logicBlock.getInput('left').connection;
        addCondition(workspace, logicCmd, { ...ctx, connection: left });
        const right = logicBlock.getInput('right').connection;
        addCondition(workspace, cmd, { ...ctx, connection: right });
    } else {
        addCondition(workspace, cmd, { ...ctx, connection: condConnection });
    }
    return {
        connection: thenConnection,
        ifBlocks: [...ifBlocks, block],
        logicStack: null
    };
}

export const IF = genericIF.bind(null, 'lba_if');
export const SWIF = genericIF.bind(null, 'lba_swif');
export const ONEIF = genericIF.bind(null, 'lba_oneif');

export function ELSE(_workspace, _cmd, ctx) {
    const ifBlock = last(ctx.ifBlocks) as any;
    ifBlock.enableElseBlock();
    const elseConnection = ifBlock.getInput('else_statements').connection;
    return {
        connection: elseConnection,
    };
}

export function ENDIF(_workspace, _cmd, ctx) {
    const ifBlock = last(ctx.ifBlocks) as any;
    return {
        ifBlocks: dropRight(ctx.ifBlocks),
        connection: ifBlock.nextConnection
    };
}

export function SWITCH(workspace, cmd, ctx) {
    const { connection } = ctx;
    const block = newBlock(workspace, 'lba_switch', cmd);
    const switchBlocks = ctx.switchBlocks || [];
    connection.connect(block.previousConnection);
    const condName = cmd.data.condition.op.command;
    if (condName in conditions) {
        conditions[condName](workspace, cmd, {
            ...ctx,
            connection: block.getInput('condition').connection
        });
    }
    return {
        switchBlocks: [...switchBlocks, block]
    };
}

export function CASE(_workspace, _cmd, ctx) {
    const { switchBlocks } = ctx;
    const block = last(switchBlocks) as any;
    const { statementsInput } = block.addCase();
    return {
        connection: statementsInput.connection
    };
}

export function DEFAULT(_workspace, _cmd, ctx) {
    const { switchBlocks } = ctx;
    const block = last(switchBlocks) as any;
    block.enableDefaultCase();
    const statementsInput = block.getInput('default_statement');
    return {
        connection: statementsInput.connection
    };
}

export function END_SWITCH(_workspace, _cmd, ctx) {
    const switchBlocks = last(ctx.switchBlocks) as any;
    return {
        switchBlocks: dropRight(ctx.switchBlocks),
        connection: switchBlocks.nextConnection
    };
}

export function SET_COMPORTEMENT(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_behaviour', cmd);
    connection.connect(block.previousConnection);
    const { comportementMap } = workspace.actor.scripts.life;
    const value = comportementMap[cmd.data.args[0].value];
    block.setFieldValue(`${value}`, 'arg_0');
    return { connection: block.nextConnection };
}

export function SET_COMPORTEMENT_OBJ(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_behaviour_obj', cmd);
    block.actor = workspace.scene.actors[cmd.data.args[0].value];
    block.setFieldValue(`${cmd.data.args[0].value}`, 'actor');
    const { comportementMap } = workspace.scene.actors[cmd.data.args[0].value].scripts.life;
    const value = comportementMap[cmd.data.args[1].value];
    block.setFieldValue(`${value}`, 'arg_0');
    connection.connect(block.previousConnection);
    return { connection: block.nextConnection };
}

export function SET_VAR_CUBE(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_varscene', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'arg_0');
    block.setFieldValue(cmd.data.args[1].value, 'arg_1');
    return { connection: block.nextConnection };
}

export function SET_VAR_GAME(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_vargame', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'arg_0');
    block.setFieldValue(cmd.data.args[1].value, 'arg_1');
    return { connection: block.nextConnection };
}

export function ANIM(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_anim', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'arg_0');
    return { connection: block.nextConnection };
}

export function ANIM_OBJ(workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_set_anim_obj', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(cmd.data.args[0].value, 'arg_0');
    return { connection: block.nextConnection };
}

function unknownCmd(label, workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_unknown_life_cmd', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(label, 'label');
    return { connection: block.nextConnection };
}

function unknownCmdObj(label, workspace, cmd, {connection}) {
    const block = newBlock(workspace, 'lba_unknown_life_cmd_obj', cmd);
    connection.connect(block.previousConnection);
    block.setFieldValue(label, 'label');
    return { connection: block.nextConnection };
}

export const MESSAGE = unknownCmd.bind(null, 'message');
export const CINEMA_MODE = unknownCmd.bind(null, 'cinema_mode');
export const SET_CAMERA = unknownCmd.bind(null, 'set_camera');
export const BETA = unknownCmd.bind(null, 'beta');
export const POS_POINT = unknownCmd.bind(null, 'pos_point');
export const CAM_FOLLOW = unknownCmd.bind(null, 'cam_follow');
export const SET_DIRMODE = unknownCmd.bind(null, 'set_dirmode');
export const SET_TRACK = unknownCmd.bind(null, 'set_track');
export const SAVE_HERO = unknownCmd.bind(null, 'save_hero');
export const SET_TRACK_OBJ = unknownCmdObj.bind(null, 'set_track_obj');
export const MESSAGE_ZOE = unknownCmd.bind(null, 'message_zoe');
export const BREAK = unknownCmd.bind(null, 'break');
export const SET_HOLO_POS = unknownCmd.bind(null, 'set_holo_pos');
export const SET_BEHAVIOUR = unknownCmd.bind(null, 'set_behaviour');
// export const END = unknownCmd.bind(null, 'end');
export const SET_DOOR_DOWN = unknownCmd.bind(null, 'set_door_down');
export const USE_ONE_LITTLE_KEY = unknownCmd.bind(null, 'use_one_little_key');
export const END_LIFE = unknownCmd.bind(null, 'end_life');
export const SUICIDE = unknownCmd.bind(null, 'suicide');
export const STOP_CURRENT_TRACK = unknownCmd.bind(null, 'stop_current_track');
export const RESTORE_LAST_TRACK = unknownCmd.bind(null, 'restore_last_track');
export const MESSAGE_OBJ = unknownCmdObj.bind(null, 'message_obj');
export const SET_DIRMODE_OBJ = unknownCmdObj.bind(null, 'set_dirmode_obj');
export const CAMERA_CENTER = unknownCmd.bind(null, 'camera_center');
export const CLR_HOLO_POS = unknownCmd.bind(null, 'clr_holo_pos');
export const RESTORE_HERO = unknownCmd.bind(null, 'restore_hero');
export const ADD_VAR_GAME = unknownCmd.bind(null, 'add_var_game');
export const VAR_GAME_TO_TRACK = unknownCmd.bind(null, 'var_game_to_track');
export const TRACK_TO_VAR_GAME = unknownCmd.bind(null, 'track_to_var_game');
export const KILL_OBJ = unknownCmdObj.bind(null, 'kill_obj');
export const FOUND_OBJECT = unknownCmd.bind(null, 'found_object');
export const GIVE_BONUS = unknownCmd.bind(null, 'give_bonus');
export const SAMPLE = unknownCmd.bind(null, 'sample');
export const OR_CASE = unknownCmd.bind(null, 'or_case');
export const SAVE_COMPORTEMENT = unknownCmd.bind(null, 'save_comportement');
export const RESTORE_COMPORTEMENT = unknownCmd.bind(null, 'restore_comportement');
export const HIT = unknownCmd.bind(null, 'hit');
export const SET_SPRITE = unknownCmd.bind(null, 'set_sprite');
export const SET_HIT_ZONE = unknownCmd.bind(null, 'set_hit_zone');
export const ADD_VAR_CUBE = unknownCmd.bind(null, 'add_var_cube');
export const INVISIBLE = unknownCmd.bind(null, 'invisible');
export const SET_ANIM_DIAL = unknownCmd.bind(null, 'set_anim_dial');
export const BODY = unknownCmd.bind(null, 'body');
export const NO_BODY = unknownCmd.bind(null, 'no_body');
export const IMPACT_POINT = unknownCmd.bind(null, 'impact_point');
export const ADD_MESSAGE = unknownCmd.bind(null, 'add_message');
export const END_MESSAGE = unknownCmd.bind(null, 'end_message');
export const BALLOON = unknownCmd.bind(null, 'balloon');
export const ADD_CHOICE = unknownCmd.bind(null, 'add_choice');
export const ASK_CHOICE_OBJ = unknownCmdObj.bind(null, 'ask_choice_obj');
export const SUB_MONEY = unknownCmd.bind(null, 'sub_money');
export const PLAY_MUSIC = unknownCmd.bind(null, 'play_music');
export const RETURN = unknownCmd.bind(null, 'return');
export const BACKGROUND = unknownCmd.bind(null, 'background');
export const SET_DOOR_RIGHT = unknownCmd.bind(null, 'set_door_right');
export const CAN_FALL = unknownCmd.bind(null, 'can_fall');
export const BRICK_COL = unknownCmd.bind(null, 'brick_col');
export const ADD_MONEY = unknownCmd.bind(null, 'add_money');
export const BODY_OBJ = unknownCmdObj.bind(null, 'body_obj');
export const NO_SHOCK = unknownCmd.bind(null, 'no_shock');
export const ASK_CHOICE = unknownCmd.bind(null, 'ask_choice');
export const PCX = unknownCmd.bind(null, 'pcx');
export const MEMO_SLATE = unknownCmd.bind(null, 'memo_slate');
export const SET_GRM = unknownCmd.bind(null, 'set_grm');
export const INVERSE_BETA = unknownCmd.bind(null, 'inverse_beta');
export const PLAY_VIDEO = unknownCmd.bind(null, 'play_video');
export const SET_RAIL = unknownCmd.bind(null, 'set_rail');
export const SET_DOOR_UP = unknownCmd.bind(null, 'set_door_up');
export const SET_CHANGE_CUBE = unknownCmd.bind(null, 'set_change_cube');
export const FADE_TO_PAL = unknownCmd.bind(null, 'fade_to_pal');
export const CHANGE_CUBE = unknownCmd.bind(null, 'change_cube');
export const FLOW_POINT = unknownCmd.bind(null, 'flow_point');
export const STATE_INVENTORY = unknownCmd.bind(null, 'state_inventory');
export const SET_USED_INVENTORY = unknownCmd.bind(null, 'set_used_inventory');
export const SHADOW_OBJ = unknownCmdObj.bind(null, 'shadow_obj');
export const ADD_LIFE_POINT_OBJ = unknownCmdObj.bind(null, 'add_life_point_obj');
export const INC_CLOVER_BOX = unknownCmd.bind(null, 'inc_clover_box');
export const ANIM_SET = unknownCmd.bind(null, 'anim_set');
export const PCX_MESS_OBJ = unknownCmdObj.bind(null, 'pcx_mess_obj');
export const SET_FRAME = unknownCmd.bind(null, 'set_frame');
export const SET_MAGIC_LEVEL = unknownCmd.bind(null, 'set_magic_level');
export const NEW_SAMPLE = unknownCmd.bind(null, 'new_sample');
export const ANIM_TEXTURE = unknownCmd.bind(null, 'anim_texture');
export const STOP_CURRENT_TRACK_OBJ = unknownCmdObj.bind(null, 'stop_current_track_obj');
export const PARM_SAMPLE = unknownCmd.bind(null, 'parm_sample');
export const SAVE_COMPORTEMENT_OBJ = unknownCmdObj.bind(null, 'save_comportement_obj');
export const SET_DOOR_LEFT = unknownCmd.bind(null, 'set_door_left');
export const FLOW_OBJ = unknownCmd.bind(null, 'flow_obj');
export const OBJ_COL = unknownCmd.bind(null, 'obj_col');
export const ECLAIR = unknownCmd.bind(null, 'eclair');
export const IMPACT_OBJ = unknownCmdObj.bind(null, 'impact_obj');
export const SAMPLE_STOP = unknownCmd.bind(null, 'sample_stop');
export const REPEAT_SAMPLE = unknownCmd.bind(null, 'repeat_sample');
export const THE_END = unknownCmd.bind(null, 'the_end');
export const POS_OBJ_AROUND = unknownCmd.bind(null, 'pos_obj_around');
export const INIT_BUGGY = unknownCmd.bind(null, 'init_buggy');
export const FULL_POINT = unknownCmd.bind(null, 'full_point');
export const SET_LIFE_POINT_OBJ = unknownCmdObj.bind(null, 'set_life_point_obj');
export const SCALE = unknownCmd.bind(null, 'scale');
export const SAMPLE_ALWAYS = unknownCmd.bind(null, 'sample_always');
export const SET_ARMOR_OBJ = unknownCmdObj.bind(null, 'set_armor_obj');
export const SUB_VAR_GAME = unknownCmd.bind(null, 'sub_var_game');
export const POPCORN = unknownCmd.bind(null, 'popcorn');
export const SET_ARMOR = unknownCmd.bind(null, 'set_armor');
export const SUB_VAR_CUBE = unknownCmd.bind(null, 'sub_var_cube');
export const RAIN = unknownCmd.bind(null, 'rain');
export const SET_FRAME_3DS = unknownCmd.bind(null, 'set_frame_3ds');
export const RESTORE_LAST_TRACK_OBJ = unknownCmdObj.bind(null, 'restore_last_track_obj');
export const ESCALATOR = unknownCmd.bind(null, 'escalator');
// export const NOP = unknownCmd.bind(null, 'nop');
export const GAME_OVER = unknownCmd.bind(null, 'game_over');
export const SUB_LIFE_POINT_OBJ = unknownCmdObj.bind(null, 'sub_life_point_obj');
export const ACTION = unknownCmd.bind(null, 'action');
export const PALETTE = unknownCmd.bind(null, 'palette');
