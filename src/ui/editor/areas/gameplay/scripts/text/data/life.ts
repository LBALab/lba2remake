import Indent from './indent';

export default {
    END: {
        type: 'structural',
        indent: Indent.KEEP
    },
    NOP: {
        type: 'structural',
        indent: Indent.KEEP
    },
    SNIF: {
        type: 'control',
        indent: Indent.ADD
    },
    OFFSET: {
        type: 'structural',
        indent: Indent.KEEP
    },
    NEVERIF: {
        type: 'control',
        indent: Indent.ADD
    },
    NOIF: {
        type: 'control',
        indent: Indent.ADD
    },
    'UNKNOWN(0x05)': {
        type: 'fct',
        indent: Indent.KEEP
    },
    'UNKNOWN(0x06)': {
        type: 'fct',
        indent: Indent.KEEP
    },
    'UNKNOWN(0x07)': {
        type: 'fct',
        indent: Indent.KEEP
    },
    'UNKNOWN(0x08)': {
        type: 'fct',
        indent: Indent.KEEP
    },
    'UNKNOWN(0x09)': {
        type: 'fct',
        indent: Indent.KEEP
    },
    PALETTE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    RETURN: {
        type: 'structural',
        indent: Indent.KEEP
    },
    IF: {
        type: 'control',
        indent: Indent.ADD
    },
    SWIF: {
        type: 'control',
        indent: Indent.ADD
    },
    ONEIF: {
        type: 'control',
        indent: Indent.ADD
    },
    ELSE: {
        type: 'control_no_parens',
        indent: Indent.SUB_ADD
    },
    ENDIF: {
        type: 'control_no_parens',
        indent: Indent.SUB
    },
    BODY: {
        type: 'assignment',
        indent: Indent.KEEP,
        prop: 'body'
    },
    BODY_OBJ: {
        type: 'assignment',
        indent: Indent.KEEP,
        prop: 'body'
    },
    ANIM: {
        type: 'assignment',
        indent: Indent.KEEP,
        prop: 'anim'
    },
    ANIM_OBJ: {
        type: 'assignment',
        indent: Indent.KEEP,
        prop: 'anim'
    },
    SET_CAMERA: {
        type: 'assignment',
        indent: Indent.KEEP,
        prop: 'camera'
    },
    CAMERA_CENTER: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SET_TRACK: {
        type: 'track_assignment',
        indent: Indent.KEEP,
        prop: 'track'
    },
    SET_TRACK_OBJ: {
        type: 'track_assignment',
        indent: Indent.KEEP,
        prop: 'track'
    },
    MESSAGE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    CAN_FALL: {
        type: 'assignment',
        indent: Indent.KEEP
    },
    SET_DIRMODE: {
        type: 'assignment',
        indent: Indent.KEEP,
        prop: 'dirmode'
    },
    SET_DIRMODE_OBJ: {
        type: 'assignment',
        indent: Indent.KEEP,
        prop: 'dirmode'
    },
    CAM_FOLLOW: {
        type: 'assignment',
        indent: Indent.KEEP
    },
    SET_HERO_BEHAVIOUR: {
        type: 'assignment',
        indent: Indent.KEEP,
        prop: 'hero_behaviour'
    },
    SET_VAR_CUBE: {
        type: 'var_assignment',
        indent: Indent.KEEP
    },
    BEHAVIOUR: {
        type: 'structural',
        indent: Indent.ADD
    },
    SET_BEHAVIOUR: {
        type: 'structural_assignment',
        indent: Indent.KEEP,
        prop: 'behaviour'
    },
    SET_BEHAVIOUR_OBJ: {
        type: 'structural_assignment',
        indent: Indent.KEEP,
        prop: 'behaviour'
    },
    END_BEHAVIOUR: {
        type: 'structural',
        indent: Indent.SUB
    },
    SET_VAR_GAME: {
        type: 'var_assignment',
        indent: Indent.KEEP
    },
    KILL_OBJ: {
        type: 'structural',
        indent: Indent.KEEP
    },
    SUICIDE: {
        type: 'structural',
        indent: Indent.KEEP
    },
    USE_ONE_LITTLE_KEY: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SUB_MONEY: {
        type: 'decrement',
        indent: Indent.KEEP,
        prop: 'money'
    },
    END_LIFE: {
        type: 'structural',
        indent: Indent.KEEP
    },
    SAVE_CURRENT_TRACK: {
        type: 'track',
        indent: Indent.KEEP
    },
    RESTORE_LAST_TRACK: {
        type: 'track',
        indent: Indent.KEEP
    },
    MESSAGE_OBJ: {
        type: 'fct',
        indent: Indent.KEEP
    },
    INC_CHAPTER: {
        type: 'fct',
        indent: Indent.KEEP
    },
    FOUND_OBJECT: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SET_DOOR_LEFT: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SET_DOOR_RIGHT: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SET_DOOR_UP: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SET_DOOR_DOWN: {
        type: 'fct',
        indent: Indent.KEEP
    },
    GIVE_BONUS: {
        type: 'fct',
        indent: Indent.KEEP
    },
    CHANGE_CUBE: {
        type: 'structural',
        indent: Indent.KEEP,
        prop: 'goto_scene'
    },
    OBJ_COL: {
        type: 'fct',
        indent: Indent.KEEP
    },
    BRICK_COL: {
        type: 'fct',
        indent: Indent.KEEP
    },
    OR_IF: {
        type: 'control',
        indent: Indent.KEEP
    },
    INVISIBLE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SHADOW_OBJ: {
        type: 'fct',
        indent: Indent.KEEP
    },
    POS_POINT: {
        type: 'assignment',
        indent: Indent.KEEP,
        prop: 'position'
    },
    SET_MAGIC_LEVEL: {
        type: 'assignment',
        indent: Indent.KEEP,
        prop: 'magic_level'
    },
    SUB_MAGIC_POINT: {
        type: 'decrement',
        indent: Indent.KEEP,
        prop: 'magic_points'
    },
    SET_LIFE_POINT_OBJ: {
        type: 'assignment',
        indent: Indent.KEEP,
        prop: 'life_points'
    },
    SUB_LIFE_POINT_OBJ: {
        type: 'decrement',
        indent: Indent.KEEP,
        prop: 'life_points'
    },
    HIT: {
        type: 'fct',
        indent: Indent.KEEP
    },
    PLAY_VIDEO: {
        type: 'fct',
        indent: Indent.KEEP
    },
    ECLAIR: {
        type: 'fct',
        indent: Indent.KEEP
    },
    INC_CLOVER_BOX: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SET_USED_INVENTORY: {
        type: 'assignment',
        indent: Indent.KEEP
    },
    ADD_CHOICE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    ASK_CHOICE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    INIT_BUGGY: {
        type: 'fct',
        indent: Indent.KEEP
    },
    MEMO_SLATE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SET_HOLO_POS: {
        type: 'assignment',
        indent: Indent.KEEP
    },
    CLR_HOLO_POS: {
        type: 'fct',
        indent: Indent.KEEP
    },
    ADD_FUEL: {
        type: 'increment',
        indent: Indent.KEEP,
        prop: 'fuel'
    },
    SUB_FUEL: {
        type: 'decrement',
        indent: Indent.KEEP,
        prop: 'fuel'
    },
    SET_GRM: {
        type: 'assignment',
        indent: Indent.KEEP
    },
    SET_CHANGE_CUBE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    MESSAGE_ZOE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    FULL_POINT: {
        type: 'fct',
        indent: Indent.KEEP
    },
    BETA: {
        type: 'assignment',
        indent: Indent.KEEP,
        prop: 'angle'
    },
    FADE_TO_PAL: {
        type: 'fct',
        indent: Indent.KEEP
    },
    ACTION: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SET_FRAME: {
        type: 'assignment',
        indent: Indent.KEEP
    },
    SET_SPRITE: {
        type: 'assignment',
        indent: Indent.KEEP
    },
    SET_FRAME_3DS: {
        type: 'assignment',
        indent: Indent.KEEP
    },
    IMPACT_OBJ: {
        type: 'fct',
        indent: Indent.KEEP
    },
    IMPACT_POINT: {
        type: 'fct',
        indent: Indent.KEEP
    },
    ADD_MESSAGE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    BALLOON: {
        type: 'fct',
        indent: Indent.KEEP
    },
    NO_SHOCK: {
        type: 'fct',
        indent: Indent.KEEP
    },
    ASK_CHOICE_OBJ: {
        type: 'fct',
        indent: Indent.KEEP
    },
    CINEMA_MODE: {
        type: 'assignment',
        indent: Indent.KEEP
    },
    SAVE_HERO: {
        type: 'fct',
        indent: Indent.KEEP
    },
    RESTORE_HERO: {
        type: 'fct',
        indent: Indent.KEEP
    },
    ANIM_SET: {
        type: 'fct',
        indent: Indent.KEEP
    },
    RAIN: {
        type: 'fct',
        indent: Indent.KEEP
    },
    GAME_OVER: {
        type: 'structural',
        indent: Indent.KEEP
    },
    THE_END: {
        type: 'structural',
        indent: Indent.KEEP
    },
    ESCALATOR: {
        type: 'fct',
        indent: Indent.KEEP
    },
    PLAY_MUSIC: {
        type: 'fct',
        indent: Indent.KEEP
    },
    TRACK_TO_VAR_GAME: {
        type: 'track_fct',
        indent: Indent.KEEP
    },
    VAR_GAME_TO_TRACK: {
        type: 'track_fct',
        indent: Indent.KEEP
    },
    ANIM_TEXTURE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    ADD_MESSAGE_OBJ: {
        type: 'fct',
        indent: Indent.KEEP
    },
    BRUTAL_EXIT: {
        type: 'fct',
        indent: Indent.KEEP
    },
    REPLACE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SCALE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SET_ARMOR: {
        type: 'assignment',
        indent: Indent.KEEP
    },
    SET_ARMOR_OBJ: {
        type: 'assignment',
        indent: Indent.KEEP
    },
    ADD_LIFE_POINT_OBJ: {
        type: 'increment',
        indent: Indent.KEEP,
        prop: 'life_points'
    },
    STATE_INVENTORY: {
        type: 'fct',
        indent: Indent.KEEP
    },
    AND_IF: {
        type: 'control',
        indent: Indent.KEEP
    },
    SWITCH: {
        type: 'control',
        indent: Indent.ADD
    },
    OR_CASE: {
        type: 'control_no_parens',
        indent: Indent.KEEP
    },
    CASE: {
        type: 'control_no_parens',
        indent: Indent.ADD
    },
    DEFAULT: {
        type: 'control_no_parens',
        indent: Indent.ADD
    },
    BREAK: {
        type: 'control_no_parens',
        indent: Indent.POST_SUB
    },
    END_SWITCH: {
        type: 'control_no_parens',
        indent: Indent.SUB
    },
    SET_HIT_ZONE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SAVE_BEHAVIOUR: {
        type: 'structural',
        indent: Indent.KEEP
    },
    RESTORE_BEHAVIOUR: {
        type: 'structural',
        indent: Indent.KEEP
    },
    SAMPLE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SAMPLE_RND: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SAMPLE_ALWAYS: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SAMPLE_STOP: {
        type: 'fct',
        indent: Indent.KEEP
    },
    REPEAT_SAMPLE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    BACKGROUND: {
        type: 'fct',
        indent: Indent.KEEP
    },
    ADD_VAR_GAME: {
        type: 'var_increment',
        indent: Indent.KEEP
    },
    SUB_VAR_GAME: {
        type: 'var_decrement',
        indent: Indent.KEEP
    },
    ADD_VAR_CUBE: {
        type: 'var_increment',
        indent: Indent.KEEP
    },
    SUB_VAR_CUBE: {
        type: 'var_decrement',
        indent: Indent.KEEP
    },
    'UNKNOWN(0x84)': {
        type: 'fct',
        indent: Indent.KEEP
    },
    SET_RAIL: {
        type: 'fct',
        indent: Indent.KEEP
    },
    INVERSE_BETA: {
        type: 'fct',
        indent: Indent.KEEP
    },
    NO_BODY: {
        type: 'fct',
        indent: Indent.KEEP
    },
    ADD_MONEY: {
        type: 'increment',
        indent: Indent.KEEP,
        prop: 'money'
    },
    SAVE_CURRENT_TRACK_OBJ: {
        type: 'track',
        indent: Indent.KEEP
    },
    RESTORE_LAST_TRACK_OBJ: {
        type: 'track',
        indent: Indent.KEEP
    },
    SAVE_BEHAVIOUR_OBJ: {
        type: 'structural',
        indent: Indent.KEEP
    },
    RESTORE_BEHAVIOUR_OBJ: {
        type: 'structural',
        indent: Indent.KEEP
    },
    SPY: {
        type: 'fct',
        indent: Indent.KEEP
    },
    DEBUG: {
        type: 'fct',
        indent: Indent.KEEP
    },
    DEBUG_OBJ: {
        type: 'fct',
        indent: Indent.KEEP
    },
    POPCORN: {
        type: 'fct',
        indent: Indent.KEEP
    },
    FLOW_POINT: {
        type: 'fct',
        indent: Indent.KEEP
    },
    FLOW_OBJ: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SET_ANIM_DIAL: {
        type: 'fct',
        indent: Indent.KEEP
    },
    PCX: {
        type: 'fct',
        indent: Indent.KEEP
    },
    END_MESSAGE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    END_MESSAGE_OBJ: {
        type: 'fct',
        indent: Indent.KEEP
    },
    PARM_SAMPLE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    NEW_SAMPLE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    POS_OBJ_AROUND: {
        type: 'fct',
        indent: Indent.KEEP
    },
    PCX_MESS_OBJ: {
        type: 'fct',
        indent: Indent.KEEP
    },

    LABEL: {
        type: 'fct',
        indent: Indent.KEEP
    },
    ZOOM: {
        type: 'fct',
        indent: Indent.KEEP
    },
    BIG_MESSAGE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    INIT_PINGOUIN: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SAY_MESSAGE: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SAY_MESSAGE_OBJ: {
        type: 'fct',
        indent: Indent.KEEP
    },
    GRM_OFF: {
        type: 'fct',
        indent: Indent.KEEP
    },
    FADE_PAL_RED: {
        type: 'fct',
        indent: Indent.KEEP
    },
    FADE_ALARM_RED: {
        type: 'fct',
        indent: Indent.KEEP
    },
    FADE_ALARM_PAL: {
        type: 'fct',
        indent: Indent.KEEP
    },
    FADE_RED_PAL: {
        type: 'fct',
        indent: Indent.KEEP
    },
    FADE_RED_ALARM: {
        type: 'fct',
        indent: Indent.KEEP
    },
    FADE_PAL_ALARM: {
        type: 'fct',
        indent: Indent.KEEP
    },
    EXPLODE_OBJ: {
        type: 'fct',
        indent: Indent.KEEP
    },
    BUBBLE_ON: {
        type: 'fct',
        indent: Indent.KEEP
    },
    BUBBLE_OFF: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SET_DARK_PAL: {
        type: 'fct',
        indent: Indent.KEEP
    },
    SET_NORMAL_PAL: {
        type: 'fct',
        indent: Indent.KEEP
    },
    MESSAGE_SENDELL: {
        type: 'fct',
        indent: Indent.KEEP
    },
    HOLOMAP_TRAJ: {
        type: 'fct',
        indent: Indent.KEEP
    },
    MIDI_OFF: {
        type: 'fct',
        indent: Indent.KEEP
    },
    PROJ_ISO: {
        type: 'fct',
        indent: Indent.KEEP
    },
    PROJ_3D: {
        type: 'fct',
        indent: Indent.KEEP
    },
    TEXT: {
        type: 'fct',
        indent: Indent.KEEP
    },
    CLEAR_TEXT: {
        type: 'fct',
        indent: Indent.KEEP
    }
};
