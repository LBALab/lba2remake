import * as lf from '../../life';
import * as cm from '../../common';
import * as st from '../../structural';

export const LifeOpcode = [
    {
        opcode: 0x00,
        command: 'END',
        handler: st.END
    },
    {
        opcode: 0x01,
        command: 'NOP',
        handler: st.NOP
    },
    {
        opcode: 0x02,
        command: 'SNIF',
        handler: st.SNIF,
        args: ['_Uint16:offset'],
        condition: true,
        operator: true
    },
    {
        opcode: 0x03,
        command: 'OFFSET',
        handler: st.OFFSET
    },
    {
        opcode: 0x04,
        command: 'NEVERIF',
        handler: st.NEVERIF,
        args: ['_Uint16:offset'],
        condition: true,
        operator: true
    },
    {
        opcode: 0x05,
        command: 'UNKNOWN(0x05)',
        handler: st.NOP
    },
    {
        opcode: 0x06,
        command: 'NOIF',
        handler: st.NOIF,
        args: ['_Uint16:offset'],
        condition: true,
        operator: true
    },
    {
        opcode: 0x07,
        command: 'UNKNOWN(0x07)',
        handler: st.NOP
    },
    {
        opcode: 0x08,
        command: 'UNKNOWN(0x08)',
        handler: st.NOP
    },
    {
        opcode: 0x09,
        command: 'UNKNOWN(0x09)',
        handler: st.NOP
    },
    {
        opcode: 0x0A,
        command: 'LABEL',
        handler: lf.LABEL,
        args: ['Uint8']
    },
    {
        opcode: 0x0B,
        command: 'RETURN',
        handler: st.RETURN
    },
    {
        opcode: 0x0C,
        command: 'IF',
        handler: st.IF,
        args: ['_Uint16:offset'],
        condition: true,
        operator: true
    },
    {
        opcode: 0x0D,
        command: 'SWIF',
        handler: st.SWIF,
        args: ['_Uint16:offset'],
        condition: true,
        operator: true,
        cmdState: true
    },
    {
        opcode: 0x0E,
        command: 'ONEIF',
        handler: st.ONEIF,
        args: ['_Uint16:offset'],
        condition: true,
        operator: true,
        cmdState: true
    },
    {
        opcode: 0x0F,
        command: 'ELSE',
        handler: st.ELSE,
        args: ['_Uint16:offset']
    },
    {
        opcode: 0x10,
        command: 'ENDIF',
        handler: st.ENDIF
    },
    {
        opcode: 0x11,
        command: 'BODY',
        handler: cm.BODY,
        args: ['Uint8:body']
    },
    {
        opcode: 0x12,
        command: 'BODY_OBJ',
        handler: lf.BODY_OBJ,
        args: ['Uint8:actor', 'Uint8:body']
    },
    {
        opcode: 0x13,
        command: 'ANIM',
        handler: cm.ANIM,
        args: ['Uint8:anim']
    },
    {
        opcode: 0x14,
        command: 'ANIM_OBJ',
        handler: lf.ANIM_OBJ,
        args: ['Uint8:actor', 'Uint8:anim']
    },
    {
        opcode: 0x15,
        command: 'SET_LIFE',
        handler: st.SET_BEHAVIOUR,
        args: ['Uint16']
    },
    {
        opcode: 0x16,
        command: 'SET_LIFE_OBJ',
        handler: st.SET_BEHAVIOUR_OBJ,
        args: ['Uint8', 'Uint16']
    },
    {
        opcode: 0x17,
        command: 'SET_TRACK',
        handler: st.SET_TRACK,
        args: ['Uint16:number']
    },
    {
        opcode: 0x18,
        command: 'SET_TRACK_OBJ',
        handler: st.SET_TRACK_OBJ,
        args: ['Uint8:actor', 'Uint16:number']
    },
    {
        opcode: 0x19,
        command: 'MESSAGE',
        handler: lf.MESSAGE,
        args: ['Uint16:text'],
        cmdState: true
    },
    {
        opcode: 0x1A,
        command: 'CAN_FALL',
        handler: lf.CAN_FALL,
        args: ['Uint8']
    },
    {
        opcode: 0x1B,
        command: 'SET_DIRMODE',
        handler: lf.SET_DIRMODE,
        args: ['Uint8:dirmode']
    },
    {
        opcode: 0x1C,
        command: 'SET_DIRMODE_OBJ',
        handler: lf.SET_DIRMODE_OBJ,
        args: ['Uint8:actor', 'Uint8:dirmode']
    },
    {
        opcode: 0x1D,
        command: 'CAM_FOLLOW',
        handler: lf.CAM_FOLLOW,
        args: ['Uint8:actor']
    },
    {
        opcode: 0x1E,
        command: 'SET_HERO_BEHAVIOUR',
        handler: lf.SET_HERO_BEHAVIOUR,
        args: ['Uint8:behaviour']
    },
    {
        opcode: 0x1F,
        command: 'SET_VAR_CUBE',
        handler: lf.SET_VAR_CUBE,
        args: ['Uint8:varcube', 'Uint8:var_value']
    },
    {
        opcode: 0x20,
        command: 'BEHAVIOUR',
        handler: st.BEHAVIOUR,
        args: ['Uint8:label']
    },
    {
        opcode: 0x21,
        command: 'SET_BEHAVIOUR',
        handler: st.SET_BEHAVIOUR,
        args: ['Uint16:offset']
    },
    {
        opcode: 0x22,
        command: 'SET_BEHAVIOUR_OBJ',
        handler: st.SET_BEHAVIOUR_OBJ,
        args: ['Uint8:actor', 'Uint16:label']
    },
    {
        opcode: 0x23,
        command: 'END_BEHAVIOUR',
        handler: st.END_BEHAVIOUR
    },
    {
        opcode: 0x24,
        command: 'SET_VAR_GAME',
        handler: lf.SET_VAR_GAME,
        args: ['Uint8:vargame', 'Uint8:var_value']
    },
    {
        opcode: 0x25,
        command: 'KILL_OBJ',
        handler: lf.KILL_OBJ,
        args: ['Uint8:actor']
    },
    {
        opcode: 0x26,
        command: 'SUICIDE',
        handler: lf.SUICIDE
    },
    {
        opcode: 0x27,
        command: 'USE_ONE_LITTLE_KEY',
        handler: lf.USE_ONE_LITTLE_KEY
    },
    {
        opcode: 0x28,
        command: 'SUB_MONEY',
        handler: lf.SUB_MONEY,
        args: ['Int16']
    },
    {
        opcode: 0x29,
        command: 'END_LIFE',
        handler: st.END_LIFE
    },
    {
        opcode: 0x2A,
        command: 'SAVE_CURRENT_TRACK',
        handler: st.SAVE_CURRENT_TRACK
    },
    {
        opcode: 0x2B,
        command: 'RESTORE_LAST_TRACK',
        handler: st.RESTORE_LAST_TRACK
    },
    {
        opcode: 0x2C,
        command: 'MESSAGE_OBJ',
        handler: lf.MESSAGE_OBJ,
        args: ['Uint8:actor', 'Uint16:text'],
        cmdState: true
    },
    {
        opcode: 0x2D,
        command: 'INC_CHAPTER',
        handler: lf.INC_CHAPTER
    },
    {
        opcode: 0x2E,
        command: 'FOUND_OBJECT',
        handler: lf.FOUND_OBJECT,
        args: ['Uint8:vargame'],
        cmdState: true
    },
    {
        opcode: 0x2F,
        command: 'SET_DOOR_LEFT',
        handler: lf.SET_DOOR_LEFT,
        args: ['Int16:distance']
    },
    {
        opcode: 0x30,
        command: 'SET_DOOR_RIGHT',
        handler: lf.SET_DOOR_RIGHT,
        args: ['Int16:distance']
    },
    {
        opcode: 0x31,
        command: 'SET_DOOR_UP',
        handler: lf.SET_DOOR_UP,
        args: ['Int16:distance']
    },
    {
        opcode: 0x32,
        command: 'SET_DOOR_DOWN',
        handler: lf.SET_DOOR_DOWN,
        args: ['Int16:distance']
    },
    {
        opcode: 0x33,
        command: 'GIVE_BONUS',
        handler: lf.GIVE_BONUS,
        args: ['Uint8']
    },
    {
        opcode: 0x34,
        command: 'CHANGE_CUBE',
        handler: lf.CHANGE_CUBE,
        args: ['Uint8:scene']
    },
    {
        opcode: 0x35,
        command: 'OBJ_COL',
        handler: lf.OBJ_COL,
        args: ['Uint8']
    },
    {
        opcode: 0x36,
        command: 'BRICK_COL',
        handler: lf.BRICK_COL,
        args: ['Uint8']
    },
    {
        opcode: 0x37,
        command: 'OR_IF',
        handler: st.OR_IF,
        args: ['_Uint16:offset'],
        precond: true,
        condition: true,
        operator: true
    },
    {
        opcode: 0x38,
        command: 'INVISIBLE',
        handler: lf.INVISIBLE,
        args: ['Uint8']
    },
    {
        opcode: 0x39,
        command: 'ZOOM',
        handler: lf.ZOOM,
        args: ['Uint8']
    },
    {
        opcode: 0x3A,
        command: 'POS_POINT',
        handler: cm.POS_POINT,
        args: ['Uint8:point']
    },
    {
        opcode: 0x3B,
        command: 'SET_MAGIC_LEVEL',
        handler: lf.SET_MAGIC_LEVEL,
        args: ['Uint8']
    },
    {
        opcode: 0x3C,
        command: 'SUB_MAGIC_POINT',
        handler: lf.SUB_MAGIC_POINT,
        args: ['Uint8']
    },
    {
        opcode: 0x3D,
        command: 'SET_LIFE_POINT_OBJ',
        handler: lf.SET_LIFE_POINT_OBJ,
        args: ['Uint8:actor', 'Uint8']
    },
    {
        opcode: 0x3E,
        command: 'SUB_LIFE_POINT_OBJ',
        handler: lf.SUB_LIFE_POINT_OBJ,
        args: ['Uint8:actor', 'Uint8']
    },
    {
        opcode: 0x3F,
        command: 'HIT',
        handler: lf.HIT,
        args: ['Uint8:actor', 'Uint8']
    },
    {
        opcode: 0x40,
        command: 'PLAY_VIDEO',
        handler: lf.PLAY_VIDEO,
        args: ['string'],
        cmdState: true
    },
    {
        opcode: 0x41,
        command: 'ECLAIR',
        handler: lf.ECLAIR,
        args: ['Uint8']
    },
    {
        opcode: 0x42,
        command: 'INC_CLOVER_BOX',
        handler: lf.INC_CLOVER_BOX
    },
    {
        opcode: 0x43,
        command: 'SET_USED_INVENTORY',
        handler: lf.SET_USED_INVENTORY,
        args: ['Uint8']
    },
    {
        opcode: 0x44,
        command: 'ADD_CHOICE',
        handler: lf.ADD_CHOICE,
        args: ['Uint16:text']
    },
    {
        opcode: 0x45,
        command: 'ASK_CHOICE',
        handler: lf.ASK_CHOICE,
        args: ['Uint16'],
        cmdState: true
    },
    {
        opcode: 0x46,
        command: 'BIG_MESSAGE',
        handler: lf.BIG_MESSAGE,
        args: ['Uint16:text'],
        cmdState: true
    },
    {
        opcode: 0x47,
        command: 'INIT_PINGOUIN',
        handler: lf.INIT_PINGOUIN,
        args: ['Uint8:actor']
    },
    {
        opcode: 0x48,
        command: 'SET_HOLO_POS',
        handler: lf.SET_HOLO_POS,
        args: ['Uint8']
    },
    {
        opcode: 0x49,
        command: 'CLR_HOLO_POS',
        handler: lf.CLR_HOLO_POS,
        args: ['Uint8']
    },
    {
        opcode: 0x4A,
        command: 'ADD_FUEL',
        handler: lf.ADD_FUEL,
        args: ['Uint8']
    },
    {
        opcode: 0x4B,
        command: 'SUB_FUEL',
        handler: lf.SUB_FUEL,
        args: ['Uint8']
    },
    {
        opcode: 0x4C,
        command: 'SET_GRM',
        handler: lf.SET_GRM,
        args: ['Uint8']
    },
    {
        opcode: 0x4D,
        command: 'SAY_MESSAGE',
        handler: lf.SAY_MESSAGE,
        args: ['Uint16:text'],
        cmdState: true
    },
    {
        opcode: 0x4E,
        command: 'SAY_MESSAGE_OBJ',
        handler: lf.SAY_MESSAGE_OBJ,
        args: ['Uint8:actor', 'Uint16:text'],
        cmdState: true
    },
    {
        opcode: 0x4F,
        command: 'FULL_POINT',
        handler: lf.FULL_POINT
    },
    {
        opcode: 0x50,
        command: 'BETA',
        handler: cm.BETA,
        args: ['Int16:angle']
    },
    {
        opcode: 0x51,
        command: 'GRM_OFF',
        handler: lf.GRM_OFF,
    },
    {
        opcode: 0x52,
        command: 'FADE_PAL_RED',
        handler: lf.FADE_PAL_RED
    },
    {
        opcode: 0x53,
        command: 'FADE_ALARM_RED',
        handler: lf.FADE_ALARM_RED,
    },
    {
        opcode: 0x54,
        command: 'FADE_ALARM_PAL',
        handler: lf.FADE_ALARM_PAL,
    },
    {
        opcode: 0x55,
        command: 'FADE_RED_PAL',
        handler: lf.FADE_RED_PAL,
    },
    {
        opcode: 0x56,
        command: 'FADE_RED_ALARM',
        handler: lf.FADE_RED_ALARM,
    },
    {
        opcode: 0x57,
        command: 'FADE_PAL_ALARM',
        handler: lf.FADE_PAL_ALARM,
    },
    {
        opcode: 0x58,
        command: 'EXPLODE_OBJ',
        handler: lf.EXPLODE_OBJ,
        args: ['Uint8:actor'],
        cmdState: true
    },
    {
        opcode: 0x59,
        command: 'BUBBLE_ON',
        handler: lf.BUBBLE_ON,
    },
    {
        opcode: 0x5A,
        command: 'BUBBLE_OFF',
        handler: lf.BUBBLE_OFF,
    },
    {
        opcode: 0x5B,
        command: 'ASK_CHOICE_OBJ',
        handler: lf.ASK_CHOICE_OBJ,
        args: ['Uint8:actor', 'Uint16'],
        cmdState: true
    },
    {
        opcode: 0x5C,
        command: 'SET_DARK_PAL',
        handler: lf.SET_DARK_PAL,
    },
    {
        opcode: 0x5D,
        command: 'SET_NORMAL_PAL',
        handler: lf.SET_NORMAL_PAL
    },
    {
        opcode: 0x5E,
        command: 'MESSAGE_SENDELL',
        handler: lf.MESSAGE_SENDELL,
        cmdState: true
    },
    {
        opcode: 0x5F,
        command: 'ANIM_SET',
        handler: lf.ANIM_SET,
        args: ['Uint8:anim']
    },
    {
        opcode: 0x60,
        command: 'HOLOMAP_TRAJ',
        handler: lf.HOLOMAP_TRAJ,
        args: ['Uint8']
    },
    {
        opcode: 0x61,
        command: 'GAME_OVER',
        handler: lf.GAME_OVER
    },
    {
        opcode: 0x62,
        command: 'THE_END',
        handler: lf.THE_END
    },
    {
        opcode: 0x63,
        command: 'MIDI_OFF',
        handler: lf.MIDI_OFF,
    },
    {
        opcode: 0x64,
        command: 'PLAY_MUSIC',
        handler: lf.PLAY_MUSIC,
        args: ['Uint8'],
        skipSideScenes: true
    },
    {
        opcode: 0x65,
        command: 'PROJ_ISO',
        handler: lf.PROJ_ISO,
    },
    {
        opcode: 0x66,
        command: 'PROJ_3D',
        handler: lf.PROJ_3D,
    },
    {
        opcode: 0x67,
        command: 'TEXT',
        handler: lf.TEXT,
        args: ['Uint16:text']
    },
    {
        opcode: 0x68,
        command: 'CLEAR_TEXT',
        handler: lf.CLEAR_TEXT,
    },
    {
        opcode: 0x69,
        command: 'BRUTAL_EXIT',
        handler: lf.BRUTAL_EXIT
    },
];
