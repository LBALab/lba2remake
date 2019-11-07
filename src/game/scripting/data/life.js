import * as lf from '../life';
import * as cm from '../common';
import * as st from '../structural';
import Indent from '../indent';

export const LifeOpcode = [
    {
        opcode: 0x00,
        command: 'END',
        handler: st.END,
        indent: Indent.KEEP,
        type: 'keyword'
    },
    {
        opcode: 0x01,
        command: 'NOP',
        handler: st.NOP,
        indent: Indent.KEEP,
        type: 'keyword'
    },
    {
        opcode: 0x02,
        command: 'SNIF',
        handler: st.SNIF,
        args: ['_Uint16:offset'],
        condition: true,
        operator: true,
        indent: Indent.ADD,
        type: 'cond'
    },
    {
        opcode: 0x03,
        command: 'OFFSET',
        handler: st.OFFSET,
        indent: Indent.KEEP,
        type: 'keyword'
    },
    {
        opcode: 0x04,
        command: 'NEVERIF',
        handler: st.NEVERIF,
        args: ['_Uint16:offset'],
        condition: true,
        operator: true,
        indent: Indent.ADD,
        type: 'cond'
    },
    {
        opcode: 0x05,
        command: 'UNKNOWN(0x05)',
        handler: st.NOP,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x06,
        command: 'UNKNOWN(0x06)',
        handler: st.NOP,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x07,
        command: 'UNKNOWN(0x07)',
        handler: st.NOP,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x08,
        command: 'UNKNOWN(0x08)',
        handler: st.NOP,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x09,
        command: 'UNKNOWN(0x09)',
        handler: st.NOP,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x0A,
        command: 'PALETTE',
        handler: lf.PALETTE,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x0B,
        command: 'RETURN',
        handler: st.RETURN,
        indent: Indent.KEEP,
        type: 'keyword'
    },
    {
        opcode: 0x0C,
        command: 'IF',
        handler: st.IF,
        args: ['_Uint16:offset'],
        condition: true,
        operator: true,
        indent: Indent.ADD,
        type: 'cond'
    },
    {
        opcode: 0x0D,
        command: 'SWIF',
        handler: st.SWIF,
        args: ['_Uint16:offset'],
        condition: true,
        operator: true,
        cmdState: true,
        indent: Indent.ADD,
        type: 'cond'
    },
    {
        opcode: 0x0E,
        command: 'ONEIF',
        handler: st.ONEIF,
        args: ['_Uint16:offset'],
        condition: true,
        operator: true,
        cmdState: true,
        indent: Indent.ADD,
        type: 'cond'
    },
    {
        opcode: 0x0F,
        command: 'ELSE',
        handler: st.ELSE,
        args: ['_Uint16:offset'],
        indent: Indent.SUB_ADD,
        type: 'keyword'
    },
    {
        opcode: 0x10,
        command: 'ENDIF',
        handler: st.ENDIF,
        indent: Indent.SUB,
        type: 'keyword'
    },
    {
        opcode: 0x11,
        command: 'BODY',
        handler: cm.BODY,
        args: ['Uint8:body'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'body'
    },
    {
        opcode: 0x12,
        command: 'BODY_OBJ',
        handler: lf.BODY_OBJ,
        args: ['Uint8:actor', 'Uint8:body'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'body'
    },
    {
        opcode: 0x13,
        command: 'ANIM',
        handler: cm.ANIM,
        args: ['Uint16:anim'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'anim'
    },
    {
        opcode: 0x14,
        command: 'ANIM_OBJ',
        handler: lf.ANIM_OBJ,
        args: ['Uint8:actor', 'Uint16:anim'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'anim'
    },
    {
        opcode: 0x15,
        command: 'SET_CAMERA',
        handler: lf.SET_CAMERA,
        args: ['Uint16'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'camera',
        scope: 'scene'
    },
    {
        opcode: 0x16,
        command: 'CAMERA_CENTER',
        handler: lf.CAMERA_CENTER,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x17,
        command: 'SET_TRACK',
        handler: st.SET_TRACK,
        args: ['Uint16:label'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'track'
    },
    {
        opcode: 0x18,
        command: 'SET_TRACK_OBJ',
        handler: st.SET_TRACK_OBJ,
        args: ['Uint8:actor', 'Uint16:label'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'track'
    },
    {
        opcode: 0x19,
        command: 'MESSAGE',
        handler: lf.MESSAGE,
        args: ['Uint16:text'],
        cmdState: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x1A,
        command: 'CAN_FALL',
        handler: lf.CAN_FALL,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'assignment'
    },
    {
        opcode: 0x1B,
        command: 'SET_DIRMODE',
        handler: lf.SET_DIRMODE,
        args: ['Uint8:dirmode'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'dirmode'
    },
    {
        opcode: 0x1C,
        command: 'SET_DIRMODE_OBJ',
        handler: lf.SET_DIRMODE_OBJ,
        args: ['Uint8:actor', 'Uint8:dirmode'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'dirmode'
    },
    {
        opcode: 0x1D,
        command: 'CAM_FOLLOW',
        handler: lf.CAM_FOLLOW,
        args: ['Uint8:actor'],
        indent: Indent.KEEP,
        type: 'assignment',
        scope: 'scene'
    },
    {
        opcode: 0x1E,
        command: 'SET_BEHAVIOUR',
        handler: lf.SET_BEHAVIOUR,
        args: ['Uint8:behaviour'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'behaviour',
        scope: 'hero'
    },
    {
        opcode: 0x1F,
        command: 'SET_VAR_CUBE',
        handler: lf.SET_VAR_CUBE,
        args: ['Uint8:varcube', 'Uint8:varcube_value'],
        indent: Indent.KEEP,
        type: 'var_assignment',
        scope: 'scene'
    },
    {
        opcode: 0x20,
        command: 'COMPORTEMENT',
        handler: st.COMPORTEMENT,
        args: ['Uint8:label'],
        indent: Indent.ADD,
        type: 'keyword'
    },
    {
        opcode: 0x21,
        command: 'SET_COMPORTEMENT',
        handler: st.SET_COMPORTEMENT,
        args: ['Uint16:offset'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'comportement'
    },
    {
        opcode: 0x22,
        command: 'SET_COMPORTEMENT_OBJ',
        handler: st.SET_COMPORTEMENT_OBJ,
        args: ['Uint8:actor', 'Uint16:label'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'comportement'
    },
    {
        opcode: 0x23,
        command: 'END_COMPORTEMENT',
        handler: st.END_COMPORTEMENT,
        indent: Indent.SUB,
        type: 'keyword'
    },
    {
        opcode: 0x24,
        command: 'SET_VAR_GAME',
        handler: lf.SET_VAR_GAME,
        args: ['Uint8:vargame', 'Uint16:vargame_value'],
        indent: Indent.KEEP,
        type: 'var_assignment',
        scope: 'game'
    },
    {
        opcode: 0x25,
        command: 'KILL_OBJ',
        handler: lf.KILL_OBJ,
        args: ['Uint8:actor'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x26,
        command: 'SUICIDE',
        handler: lf.SUICIDE,
        indent: Indent.KEEP,
        type: 'keyword'
    },
    {
        opcode: 0x27,
        command: 'USE_ONE_LITTLE_KEY',
        handler: lf.USE_ONE_LITTLE_KEY,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x28,
        command: 'SUB_MONEY',
        handler: lf.SUB_MONEY,
        args: ['Int16'],
        indent: Indent.KEEP,
        type: 'decrement',
        prop: 'money',
        scope: 'hero'
    },
    {
        opcode: 0x29,
        command: 'END_LIFE',
        handler: st.END_LIFE,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x2A,
        command: 'STOP_CURRENT_TRACK',
        handler: st.STOP_CURRENT_TRACK,
        indent: Indent.KEEP,
        type: 'keyword'
    },
    {
        opcode: 0x2B,
        command: 'RESTORE_LAST_TRACK',
        handler: st.RESTORE_LAST_TRACK,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x2C,
        command: 'MESSAGE_OBJ',
        handler: lf.MESSAGE_OBJ,
        args: ['Uint8:actor', 'Uint16:text'],
        cmdState: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x2D,
        command: 'INC_CHAPTER',
        handler: lf.INC_CHAPTER,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x2E,
        command: 'FOUND_OBJECT',
        handler: lf.FOUND_OBJECT,
        args: ['Uint8:vargame'],
        cmdState: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x2F,
        command: 'SET_DOOR_LEFT',
        handler: lf.SET_DOOR_LEFT,
        args: ['Int16:distance'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x30,
        command: 'SET_DOOR_RIGHT',
        handler: lf.SET_DOOR_RIGHT,
        args: ['Int16:distance'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x31,
        command: 'SET_DOOR_UP',
        handler: lf.SET_DOOR_UP,
        args: ['Int16:distance'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x32,
        command: 'SET_DOOR_DOWN',
        handler: lf.SET_DOOR_DOWN,
        args: ['Int16:distance'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x33,
        command: 'GIVE_BONUS',
        handler: lf.GIVE_BONUS,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x34,
        command: 'CHANGE_CUBE',
        handler: lf.CHANGE_CUBE,
        args: ['Uint8:scene'],
        indent: Indent.KEEP,
        type: 'fct',
        prop: 'goto',
        scope: 'scene'
    },
    {
        opcode: 0x35,
        command: 'OBJ_COL',
        handler: lf.OBJ_COL,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x36,
        command: 'BRICK_COL',
        handler: lf.BRICK_COL,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x37,
        command: 'OR_IF',
        handler: st.OR_IF,
        args: ['_Uint16:offset'],
        precond: true,
        condition: true,
        operator: true,
        indent: Indent.KEEP,
        type: 'cond'
    },
    {
        opcode: 0x38,
        command: 'INVISIBLE',
        handler: lf.INVISIBLE,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x39,
        command: 'SHADOW_OBJ',
        handler: lf.SHADOW_OBJ,
        args: ['Uint8:actor', 'Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x3A,
        command: 'POS_POINT',
        handler: cm.POS_POINT,
        args: ['Uint8:point'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'position'
    },
    {
        opcode: 0x3B,
        command: 'SET_MAGIC_LEVEL',
        handler: lf.SET_MAGIC_LEVEL,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'magic_level',
        scope: 'hero'
    },
    {
        opcode: 0x3C,
        command: 'SUB_MAGIC_POINT',
        handler: lf.SUB_MAGIC_POINT,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'decrement',
        prop: 'magic_points',
        scope: 'hero'
    },
    {
        opcode: 0x3D,
        command: 'SET_LIFE_POINT_OBJ',
        handler: lf.SET_LIFE_POINT_OBJ,
        args: ['Uint8:actor', 'Uint8'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'life_points'
    },
    {
        opcode: 0x3E,
        command: 'SUB_LIFE_POINT_OBJ',
        handler: lf.SUB_LIFE_POINT_OBJ,
        args: ['Uint8:actor', 'Uint8'],
        indent: Indent.KEEP,
        type: 'decrement',
        prop: 'life_points'
    },
    {
        opcode: 0x3F,
        command: 'HIT',
        handler: lf.HIT,
        args: ['Uint8:actor', 'Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x40,
        command: 'PLAY_VIDEO',
        handler: lf.PLAY_VIDEO,
        args: ['string'],
        cmdState: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x41,
        command: 'ECLAIR',
        handler: lf.ECLAIR,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x42,
        command: 'INC_CLOVER_BOX',
        handler: lf.INC_CLOVER_BOX,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x43,
        command: 'SET_USED_INVENTORY',
        handler: lf.SET_USED_INVENTORY,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'assignment'
    },
    {
        opcode: 0x44,
        command: 'ADD_CHOICE',
        handler: lf.ADD_CHOICE,
        args: ['Uint16:text'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x45,
        command: 'ASK_CHOICE',
        handler: lf.ASK_CHOICE,
        args: ['Uint16'],
        cmdState: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x46,
        command: 'INIT_BUGGY',
        handler: lf.INIT_BUGGY,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x47,
        command: 'MEMO_SLATE',
        handler: lf.MEMO_SLATE,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x48,
        command: 'SET_HOLO_POS',
        handler: lf.SET_HOLO_POS,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'assignment'
    },
    {
        opcode: 0x49,
        command: 'CLR_HOLO_POS',
        handler: lf.CLR_HOLO_POS,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x4A,
        command: 'ADD_FUEL',
        handler: lf.ADD_FUEL,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'increment',
        prop: 'fuel',
        scope: 'hero'
    },
    {
        opcode: 0x4B,
        command: 'SUB_FUEL',
        handler: lf.SUB_FUEL,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'decrement',
        prop: 'fuel',
        scope: 'hero'
    },
    {
        opcode: 0x4C,
        command: 'SET_GRM',
        handler: lf.SET_GRM,
        args: ['Uint8', 'Uint8'],
        indent: Indent.KEEP,
        type: 'assignment'
    },
    {
        opcode: 0x4D,
        command: 'SET_CHANGE_CUBE',
        handler: lf.SET_CHANGE_CUBE,
        args: ['Uint8', 'Uint8'],
        indent: Indent.KEEP,
        type: 'fct',
        scope: 'scene'
    },
    {
        opcode: 0x4E,
        command: 'MESSAGE_ZOE',
        handler: lf.MESSAGE_ZOE,
        args: ['Uint16:text'],
        cmdState: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x4F,
        command: 'FULL_POINT',
        handler: lf.FULL_POINT,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x50,
        command: 'BETA',
        handler: cm.BETA,
        args: ['Int16:angle'],
        indent: Indent.KEEP,
        type: 'assignment',
        prop: 'angle'
    },
    {
        opcode: 0x51,
        command: 'FADE_TO_PAL',
        handler: lf.FADE_TO_PAL,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x52,
        command: 'ACTION',
        handler: lf.ACTION,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x53,
        command: 'SET_FRAME',
        handler: lf.SET_FRAME,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'assignment'
    },
    {
        opcode: 0x54,
        command: 'SET_SPRITE',
        handler: lf.SET_SPRITE,
        args: ['Uint8', 'Uint8'],
        indent: Indent.KEEP,
        type: 'assignment'
    },
    {
        opcode: 0x55,
        command: 'SET_FRAME_3DS',
        handler: lf.SET_FRAME_3DS,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'assignment'
    },
    {
        opcode: 0x56,
        command: 'IMPACT_OBJ',
        handler: lf.IMPACT_OBJ,
        args: ['Uint8:actor', 'Uint16', 'Uint16'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x57,
        command: 'IMPACT_POINT',
        handler: lf.IMPACT_POINT,
        args: ['Uint8', 'Uint16'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x58,
        command: 'ADD_MESSAGE',
        handler: lf.ADD_MESSAGE,
        args: ['Uint16:text'],
        cmdState: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x59,
        command: 'BALLOON',
        handler: lf.BALLOON,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x5A,
        command: 'NO_SHOCK',
        handler: lf.NO_SHOCK,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x5B,
        command: 'ASK_CHOICE_OBJ',
        handler: lf.ASK_CHOICE_OBJ,
        args: ['Uint8:actor', 'Uint16'],
        cmdState: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x5C,
        command: 'CINEMA_MODE',
        handler: lf.CINEMA_MODE,
        args: ['Uint8:boolean'],
        indent: Indent.KEEP,
        type: 'assignment',
        scope: 'scene'
    },
    {
        opcode: 0x5D,
        command: 'SAVE_HERO',
        handler: lf.SAVE_HERO,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x5E,
        command: 'RESTORE_HERO',
        handler: lf.RESTORE_HERO,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x5F,
        command: 'ANIM_SET',
        handler: lf.ANIM_SET,
        args: ['Uint16:anim'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x60,
        command: 'RAIN',
        handler: lf.RAIN,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x61,
        command: 'GAME_OVER',
        handler: lf.GAME_OVER,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x62,
        command: 'THE_END',
        handler: lf.THE_END,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x63,
        command: 'ESCALATOR',
        handler: lf.ESCALATOR,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x64,
        command: 'PLAY_MUSIC',
        handler: lf.PLAY_MUSIC,
        args: ['Uint8'],
        skipSideScenes: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x65,
        command: 'TRACK_TO_VAR_GAME',
        handler: lf.TRACK_TO_VAR_GAME,
        args: ['Uint8:vargame'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x66,
        command: 'VAR_GAME_TO_TRACK',
        handler: lf.VAR_GAME_TO_TRACK,
        args: ['Uint8:vargame'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x67,
        command: 'ANIM_TEXTURE',
        handler: lf.ANIM_TEXTURE,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x68,
        command: 'ADD_MESSAGE_OBJ',
        handler: lf.ADD_MESSAGE_OBJ,
        args: ['Uint8:actor', 'Uint16:text'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x69,
        command: 'BRUTAL_EXIT',
        handler: lf.BRUTAL_EXIT,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x6A,
        command: 'REPLACE',
        handler: lf.REPLACE,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x6B,
        command: 'SCALE',
        handler: lf.SCALE,
        args: ['Uint8', 'Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x6C,
        command: 'SET_ARMOR',
        handler: lf.SET_ARMOR,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'assignment'
    },
    {
        opcode: 0x6D,
        command: 'SET_ARMOR_OBJ',
        handler: lf.SET_ARMOR_OBJ,
        args: ['Uint8:actor', 'Uint8'],
        indent: Indent.KEEP,
        type: 'assignment'
    },
    {
        opcode: 0x6E,
        command: 'ADD_LIFE_POINT_OBJ',
        handler: lf.ADD_LIFE_POINT_OBJ,
        args: ['Uint8:actor', 'Uint8'],
        indent: Indent.KEEP,
        type: 'increment',
        prop: 'life_points'
    },
    {
        opcode: 0x6F,
        command: 'STATE_INVENTORY',
        handler: lf.STATE_INVENTORY,
        args: ['Uint8', 'Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x70,
        command: 'AND_IF',
        handler: st.AND_IF,
        args: ['_Uint16:offset'],
        precond: true,
        condition: true,
        operator: true,
        indent: Indent.KEEP,
        type: 'cond'
    },
    {
        opcode: 0x71,
        command: 'SWITCH',
        handler: st.SWITCH,
        condition: 'SWITCH',
        indent: Indent.ADD,
        type: 'cond'
    },
    {
        opcode: 0x72,
        command: 'OR_CASE',
        handler: st.OR_CASE,
        argsFirst: true,
        args: ['_Uint16:offset'],
        operator: true,
        indent: Indent.KEEP,
        type: 'keyword'
    },
    {
        opcode: 0x73,
        command: 'CASE',
        handler: st.CASE,
        argsFirst: true,
        args: ['_Uint16:offset'],
        operator: true,
        indent: Indent.ADD,
        type: 'keyword'
    },
    {
        opcode: 0x74,
        command: 'DEFAULT',
        handler: st.DEFAULT,
        indent: Indent.ADD,
        type: 'keyword'
    },
    {
        opcode: 0x75,
        command: 'BREAK',
        handler: st.BREAK,
        args: ['_Uint16:offset'],
        indent: Indent.POST_SUB,
        type: 'keyword'
    },
    {
        opcode: 0x76,
        command: 'END_SWITCH',
        handler: st.END_SWITCH,
        indent: Indent.SUB,
        type: 'keyword'
    },
    {
        opcode: 0x77,
        command: 'SET_HIT_ZONE',
        handler: lf.SET_HIT_ZONE,
        args: ['Uint8', 'Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x78,
        command: 'SAVE_COMPORTEMENT',
        handler: st.SAVE_COMPORTEMENT,
        indent: Indent.KEEP,
        type: 'keyword'
    },
    {
        opcode: 0x79,
        command: 'RESTORE_COMPORTEMENT',
        handler: st.RESTORE_COMPORTEMENT,
        indent: Indent.KEEP,
        type: 'keyword'
    },
    {
        opcode: 0x7A,
        command: 'SAMPLE',
        handler: lf.SAMPLE,
        args: ['Uint16'],
        skipSideScenes: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x7B,
        command: 'SAMPLE_RND',
        handler: lf.SAMPLE_RND,
        args: ['Uint16'],
        skipSideScenes: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x7C,
        command: 'SAMPLE_ALWAYS',
        handler: lf.SAMPLE_ALWAYS,
        args: ['Uint16'],
        skipSideScenes: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x7D,
        command: 'SAMPLE_STOP',
        handler: lf.SAMPLE_STOP,
        args: ['Uint16'],
        skipSideScenes: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x7E,
        command: 'REPEAT_SAMPLE',
        handler: lf.REPEAT_SAMPLE,
        args: ['Uint16', 'Uint8'],
        skipSideScenes: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x7F,
        command: 'BACKGROUND',
        handler: lf.BACKGROUND,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x80,
        command: 'ADD_VAR_GAME',
        handler: lf.ADD_VAR_GAME,
        args: ['Uint8:vargame', 'Uint16'],
        indent: Indent.KEEP,
        type: 'var_increment',
        scope: 'game'
    },
    {
        opcode: 0x81,
        command: 'SUB_VAR_GAME',
        handler: lf.SUB_VAR_GAME,
        args: ['Uint8:vargame', 'Uint16'],
        indent: Indent.KEEP,
        type: 'var_decrement',
        scope: 'game'
    },
    {
        opcode: 0x82,
        command: 'ADD_VAR_CUBE',
        handler: lf.ADD_VAR_CUBE,
        args: ['Uint8:varcube', 'Uint8'],
        indent: Indent.KEEP,
        type: 'var_increment',
        scope: 'scene'
    },
    {
        opcode: 0x83,
        command: 'SUB_VAR_CUBE',
        handler: lf.SUB_VAR_CUBE,
        args: ['Uint8:varcube', 'Uint8'],
        indent: Indent.KEEP,
        type: 'var_decrement',
        scope: 'scene'
    },
    {
        opcode: 0x84,
        command: 'UNKNOWN(0x84)',
        handler: st.NOP,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x85,
        command: 'SET_RAIL',
        handler: lf.SET_RAIL,
        args: ['Uint8', 'Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x86,
        command: 'INVERSE_BETA',
        handler: lf.INVERSE_BETA,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x87,
        command: 'NO_BODY',
        handler: cm.NO_BODY,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x88,
        command: 'ADD_MONEY',
        handler: lf.ADD_MONEY,
        args: ['Uint16'],
        indent: Indent.KEEP,
        type: 'increment',
        prop: 'money',
        scope: 'hero'
    },
    {
        opcode: 0x89,
        command: 'STOP_CURRENT_TRACK_OBJ',
        handler: st.STOP_CURRENT_TRACK_OBJ,
        args: ['Uint8:actor'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x8A,
        command: 'RESTORE_LAST_TRACK_OBJ',
        handler: st.RESTORE_LAST_TRACK_OBJ,
        args: ['Uint8:actor'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x8B,
        command: 'SAVE_COMPORTEMENT_OBJ',
        handler: st.SAVE_COMPORTEMENT_OBJ,
        args: ['Uint8:actor'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x8C,
        command: 'RESTORE_COMPORTEMENT_OBJ',
        handler: st.RESTORE_COMPORTEMENT_OBJ,
        args: ['Uint8:actor'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x8D,
        command: 'SPY',
        handler: lf.SPY,
        args: ['Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x8E,
        command: 'DEBUG',
        handler: lf.DEBUG,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x8F,
        command: 'DEBUG_OBJ',
        handler: lf.DEBUG_OBJ,
        args: ['Uint8:actor'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x90,
        command: 'POPCORN',
        handler: lf.POPCORN,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x91,
        command: 'FLOW_POINT',
        handler: lf.FLOW_POINT,
        args: ['Uint8', 'Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x92,
        command: 'FLOW_OBJ',
        handler: lf.FLOW_OBJ,
        args: ['Uint8:actor', 'Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x93,
        command: 'SET_ANIM_DIAL',
        handler: lf.SET_ANIM_DIAL,
        args: ['Uint16'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x94,
        command: 'PCX',
        handler: lf.PCX,
        args: ['Uint16'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x95,
        command: 'END_MESSAGE',
        handler: lf.END_MESSAGE,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x96,
        command: 'END_MESSAGE_OBJ',
        handler: lf.END_MESSAGE_OBJ,
        args: ['Uint8:actor'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x97,
        command: 'PARM_SAMPLE',
        handler: lf.PARM_SAMPLE,
        args: ['Uint16', 'Uint8', 'Uint16'],
        skipSideScenes: true,
        indent: Indent.KEEP,
        type: 'fct'
    }, // not sure about this one
    {
        opcode: 0x98,
        command: 'NEW_SAMPLE',
        handler: lf.NEW_SAMPLE,
        args: ['Uint16', 'Uint16', 'Uint8', 'Uint16'],
        skipSideScenes: true,
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x99,
        command: 'POS_OBJ_AROUND',
        handler: lf.POS_OBJ_AROUND,
        args: ['Uint8:actor', 'Uint8'],
        indent: Indent.KEEP,
        type: 'fct'
    },
    {
        opcode: 0x9A,
        command: 'PCX_MESS_OBJ',
        handler: lf.PCX_MESS_OBJ,
        args: ['Uint8:actor', 'Uint16', 'Uint16'],
        indent: Indent.KEEP,
        type: 'fct'
    }
];
