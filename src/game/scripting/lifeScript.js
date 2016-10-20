import async from 'async';

export const LifeOpcode = [
    { opcode: 0x00, command: "END", callback: lsEND, offset: 0 },
    { opcode: 0x01, command: "NOP", callback: lsNOP, offset: 0 },
    { opcode: 0x02, command: "SNIF", callback: lsSNIF, offset: 0 },
    { opcode: 0x03, command: "OFFSET", callback: lsOFFSET, offset: 2 },
    { opcode: 0x04, command: "NEVERIF", callback: lsNEVERIF, offset: 0 },
    { opcode: 0x05, command: "", callback: lsNOP, offset: 0 },
    { opcode: 0x06, command: "", callback: lsNOP, offset: 0 },
    { opcode: 0x07, command: "", callback: lsNOP, offset: 0 },
    { opcode: 0x08, command: "", callback: lsNOP, offset: 0 },
    { opcode: 0x09, command: "", callback: lsNOP, offset: 0 },
    { opcode: 0x0A, command: "PALETTE", callback: lsPALETTE, offset: 1 },
    { opcode: 0x0B, command: "RETURN", callback: lsRETURN, offset: 0 },
    { opcode: 0x0C, command: "IF", callback: lsIF, offset: 0 },
    { opcode: 0x0D, command: "SWIF", callback: lsSWIF, offset: 0 },
    { opcode: 0x0E, command: "ONEIF", callback: lsONEIF, offset: 0 },
    { opcode: 0x0F, command: "ELSE", callback: lsELSE, offset: 2 },
    { opcode: 0x10, command: "ENDIF", callback: lsENDIF, offset: 0 },
    { opcode: 0x11, command: "BODY", callback: lsBODY, offset: 1 },
    { opcode: 0x12, command: "BODY_OBJ", callback: lsBODY_OBJ, offset: 2 },
    { opcode: 0x13, command: "ANIM", callback: lsANIM, offset: 2 },
    { opcode: 0x14, command: "ANIM_OBJ", callback: lsANIM_OBJ, offset: 3 },
    { opcode: 0x15, command: "SET_CAMERA", callback: lsSET_CAMERA, offset: 2 },
    { opcode: 0x16, command: "CAMERA_CENTER", callback: lsCAMERA_CENTER, offset: 1 },
    { opcode: 0x17, command: "SET_TRACK", callback: lsSET_TRACK, offset: 2 },
    { opcode: 0x18, command: "SET_TRACK_OBJ", callback: lsSET_TRACK_OBJ, offset: 3 },
    { opcode: 0x19, command: "MESSAGE", callback: lsMESSAGE, offset: 2 },
    { opcode: 0x1A, command: "CAN_FALL", callback: lsCAN_FALL, offset: 1 },
    { opcode: 0x1B, command: "SET_DIRMODE", callback: lsSET_DIRMODE, offset: 2 },
    { opcode: 0x1C, command: "SET_DIRMODE_OBJ", callback: lsSET_DIRMODE_OBJ, offset: 3 },
    { opcode: 0x1D, command: "CAM_FOLLOW", callback: lsCAM_FOLLOW, offset: 1 },
    { opcode: 0x1E, command: "SET_BEHAVIOUR", callback: lsSET_BEHAVIOUR, offset: 1 },
    { opcode: 0x1F, command: "SET_VAR_CUBE", callback: lsSET_VAR_CUBE, offset: 2 },
    { opcode: 0x20, command: "COMPORTEMENT", callback: lsCOMPORTEMENT, offset: 1 },
    { opcode: 0x21, command: "SET_COMPORTEMENT", callback: lsSET_COMPORTEMENT, offset: 2 },
    { opcode: 0x22, command: "SET_COMPORTEMENT_OBJ", callback: lsSET_COMPORTEMENT_OBJ, offset: 3 },
    { opcode: 0x23, command: "END_COMPORTEMENT", callback: lsEND_COMPORTEMENT, offset: 0 },
    { opcode: 0x24, command: "SET_VAR_GAME", callback: lsSET_VAR_GAME, offset: 3 },
    { opcode: 0x25, command: "KILL_OBJ", callback: lsKILL_OBJ, offset: 1 },
    { opcode: 0x26, command: "SUICIDE", callback: lsSUICIDE, offset: 0 },
    { opcode: 0x27, command: "USE_ONE_LITTLE_KEY", callback: lsUSE_ONE_LITTLE_KEY, offset: 0 },
    { opcode: 0x28, command: "GIVE_GOLD_PIECES", callback: lsGIVE_GOLD_PIECES, offset: 2 },
    { opcode: 0x29, command: "END_LIFE", callback: lsEND_LIFE, offset: 0 },
    { opcode: 0x2A, command: "STOP_CURRENT_TRACK", callback: lsSTOP_CURRENT_TRACK, offset: 0 },
    { opcode: 0x2B, command: "RESTORE_LAST_TRACK", callback: lsRESTORE_LAST_TRACK, offset: 0 },
    { opcode: 0x2C, command: "MESSAGE_OBJ", callback: lsMESSAGE_OBJ, offset: 3 },
    { opcode: 0x2D, command: "INC_CHAPTER", callback: lsINC_CHAPTER, offset: 0 },
    { opcode: 0x2E, command: "FOUND_OBJECT", callback: lsFOUND_OBJECT, offset: 1 },
    { opcode: 0x2F, command: "SET_DOOR_LEFT", callback: lsSET_DOOR_LEFT, offset: 2 },
    { opcode: 0x30, command: "SET_DOOR_RIGHT", callback: lsSET_DOOR_RIGHT, offset: 2 },
    { opcode: 0x31, command: "SET_DOOR_UP", callback: lsSET_DOOR_UP, offset: 2 },
    { opcode: 0x32, command: "SET_DOOR_DOWN", callback: lsSET_DOOR_DOWN, offset: 2 },
    { opcode: 0x33, command: "GIVE_BONUS", callback: lsGIVE_BONUS, offset: 1 },
    { opcode: 0x34, command: "CHANGE_CUBE", callback: lsCHANGE_CUBE, offset: 1 },
    { opcode: 0x35, command: "OBJ_COL", callback: lsOBJ_COL, offset: 1 },
    { opcode: 0x36, command: "BRICK_COL", callback: lsBRICK_COL, offset: 1 },
    { opcode: 0x37, command: "OR_IF", callback: lsOR_IF, offset: 0 },
    { opcode: 0x38, command: "INVISIBLE", callback: lsINVISIBLE, offset: 1 },
    { opcode: 0x39, command: "SHADOW_OBJ", callback: lsSHADOW_OBJ, offset: 2 },
    { opcode: 0x3A, command: "POS_POINT", callback: lsPOS_POINT, offset: 1 },
    { opcode: 0x3B, command: "SET_MAGIC_LEVEL", callback: lsSET_MAGIC_LEVEL, offset: 1 },
    { opcode: 0x3C, command: "SUB_MAGIC_POINT", callback: lsSUB_MAGIC_POINT, offset: 1 },
    { opcode: 0x3D, command: "SET_LIFE_POINT_OBJ", callback: lsSET_LIFE_POINT_OBJ, offset: 2 },
    { opcode: 0x3E, command: "SUB_LIFE_POINT_OBJ", callback: lsSUB_LIFE_POINT_OBJ, offset: 2 },
    { opcode: 0x3F, command: "HIT_OBJ", callback: lsHIT_OBJ, offset: 2 },
    { opcode: 0x40, command: "PLAY_ACF", callback: lsPLAY_ACF, offset: 2 },
    { opcode: 0x41, command: "ECLAIR", callback: lsECLAIR, offset: 1 },
    { opcode: 0x42, command: "INC_CLOVER_BOX", callback: lsINC_CLOVER_BOX, offset: 1 },
    { opcode: 0x43, command: "SET_USED_INVENTORY", callback: lsSET_USED_INVENTORY, offset: 0 },
    { opcode: 0x44, command: "ADD_CHOICE", callback: lsADD_CHOICE, offset: 1 },
    { opcode: 0x45, command: "ASK_CHOICE", callback: lsASK_CHOICE, offset: 2 },
    { opcode: 0x46, command: "INIT_BUGGY", callback: lsINIT_BUGGY, offset: 2 },
    { opcode: 0x47, command: "MEMO_SLATE", callback: lsMEMO_SLATE, offset: 1 },
    { opcode: 0x48, command: "SET_HOLO_POS", callback: lsSET_HOLO_POS, offset: 1 },
    { opcode: 0x49, command: "CLR_HOLO_POS", callback: lsCLR_HOLO_POS, offset: 1 },
    { opcode: 0x4A, command: "ADD_FUEL", callback: lsADD_FUEL, offset: 1 },
    { opcode: 0x4B, command: "SUB_FUEL", callback: lsSUB_FUEL, offset: 1 },
    { opcode: 0x4C, command: "SET_GRM", callback: lsSET_GRM, offset: 2 },
    { opcode: 0x4D, command: "SET_CHANGE_CUBE", callback: lsSET_CHANGE_CUBE, offset: 2 },
    { opcode: 0x4E, command: "MESSAGE_ZOE", callback: lsMESSAGE_ZOE, offset: 2 },
    { opcode: 0x4F, command: "FULL_POINT", callback: lsFULL_POINT, offset: 0 },
    { opcode: 0x50, command: "BETA", callback: lsBETA, offset: 2 },
    { opcode: 0x51, command: "FADE_TO_PAL", callback: lsFADE_TO_PAL, offset: 1 },
    { opcode: 0x52, command: "ACTION", callback: lsACTION, offset: 0 },
    { opcode: 0x53, command: "SET_FRAME", callback: lsSET_FRAME, offset: 1 },
    { opcode: 0x54, command: "SET_SPRITE", callback: lsSET_SPRITE, offset: 2 },
    { opcode: 0x55, command: "SET_FRAME_3DS", callback: lsSET_FRAME_3DS, offset: 1 },
    { opcode: 0x56, command: "IMPACT_OBJ", callback: lsIMPACT_OBJ, offset: 5 },
    { opcode: 0x57, command: "IMPACT_POINT", callback: lsIMPACT_POINT, offset: 3 },
    { opcode: 0x58, command: "ADD_MESSAGE", callback: lsADD_MESSAGE, offset: 2 },
    { opcode: 0x59, command: "BALLOON", callback: lsBALLOON, offset: 1 },
    { opcode: 0x5A, command: "NO_SHOCK", callback: lsNO_SHOCK, offset: 1 },
    { opcode: 0x5B, command: "ASK_CHOICE_OBJ", callback: lsASK_CHOICE_OBJ, offset: 3 },
    { opcode: 0x5C, command: "CINEMA_MODE", callback: lsCINEMA_MODE, offset: 1 },
    { opcode: 0x5D, command: "SAVE_HERO", callback: lsSAVE_HERO, offset: 0 },
    { opcode: 0x5E, command: "RESTORE_HERO", callback: lsRESTORE_HERO, offset: 0 },
    { opcode: 0x5F, command: "ANIM_SET", callback: lsANIM_SET, offset: 2 },
    { opcode: 0x60, command: "RAIN", callback: lsRAIN, offset: 1 },
    { opcode: 0x61, command: "GAME_OVER", callback: lsGAME_OVER, offset: 0 },
    { opcode: 0x62, command: "THE_END", callback: lsTHE_END, offset: 0 },
    { opcode: 0x63, command: "ESCALATOR", callback: lsESCALATOR, offset: 0 },
    { opcode: 0x64, command: "PLAY_MUSIC", callback: lsPLAY_MUSIC, offset: 1 },
    { opcode: 0x65, command: "TRACK_TO_VAR_GAME", callback: lsTRACK_TO_VAR_GAME, offset: 1 },
    { opcode: 0x66, command: "VAR_GAME_TO_TRACK", callback: lsVAR_GAME_TO_TRACK, offset: 1 },
    { opcode: 0x67, command: "ANIM_TEXTURE", callback: lsANIM_TEXTURE, offset: 1 },
    { opcode: 0x68, command: "ADD_MESSAGE_OBJ", callback: lsADD_MESSAGE_OBJ, offset: 3 },
    { opcode: 0x69, command: "BRUTAL_EXIT", callback: lsBRUTAL_EXIT, offset: 0 },
    { opcode: 0x6A, command: "REPLACE", callback: lsREPLACE, offset: 0 },
    { opcode: 0x6B, command: "SCALE", callback: lsSCALE, offset: 2 },
    { opcode: 0x6C, command: "SET_ARMOR", callback: lsSET_ARMOR, offset: 1 },
    { opcode: 0x6D, command: "SET_ARMOR_OBJ", callback: lsSET_ARMOR_OBJ, offset: 2 },
    { opcode: 0x6E, command: "ADD_LIFE_POINT_OBJ", callback: lsADD_LIFE_POINT_OBJ, offset: 2 },
    { opcode: 0x6F, command: "STATE_INVENTORY", callback: lsSTATE_INVENTORY, offset: 2 },
    { opcode: 0x70, command: "AND_IF", callback: lsAND_IF, offset: 0 },
    { opcode: 0x71, command: "SWITCH", callback: lsSWITCH, offset: 0 },
    { opcode: 0x72, command: "OR_CASE", callback: lsOR_CASE, offset: 0 },
    { opcode: 0x73, command: "CASE", callback: lsCASE, offset: 0 },
    { opcode: 0x74, command: "DEFAULT", callback: lsDEFAULT, offset: 0 },
    { opcode: 0x75, command: "BREAK", callback: lsBREAK, offset: 2 },
    { opcode: 0x76, command: "END_SWITCH", callback: lsEND_SWITCH, offset: 0 },
    { opcode: 0x77, command: "SET_HIT_ZONE", callback: lsSET_HIT_ZONE, offset: 1 },
    { opcode: 0x78, command: "SAVE_COMPORTEMENT", callback: lsSAVE_COMPORTEMENT, offset: 0 },
    { opcode: 0x79, command: "RESTORE_COMPORTEMENT", callback: lsRESTORE_COMPORTEMENT, offset: 0 },
    { opcode: 0x7A, command: "SAMPLE", callback: lsSAMPLE, offset: 2 },
    { opcode: 0x7B, command: "SAMPLE_RND", callback: lsSAMPLE_RND, offset: 2 },
    { opcode: 0x7C, command: "SAMPLE_ALWAYS", callback: SAMPLE_ALWAYS, offset: 2 },
    { opcode: 0x7D, command: "SAMPLE_STOP", callback: lsSAMPLE_STOP, offset: 2 },
    { opcode: 0x7E, command: "REPEAT_SAMPLE", callback: lsREPEAT_SAMPLE, offset: 2 },
    { opcode: 0x7F, command: "BACKGROUND", callback: lsBACKGROUND, offset: 1 },
    { opcode: 0x80, command: "ADD_VAR_GAME", callback: lsADD_VAR_GAME, offset: 3 },
    { opcode: 0x81, command: "SUB_VAR_GAME", callback: lsSUB_VAR_GAME, offset: 3 },
    { opcode: 0x82, command: "ADD_VAR_CUBE", callback: lsADD_VAR_CUBE, offset: 2 },
    { opcode: 0x83, command: "SUB_VAR_CUBE", callback: lsSUB_VAR_CUBE, offset: 2 },
    { opcode: 0x84, command: "", callback: lsNOP, offset: 0 },
    { opcode: 0x85, command: "ESET_RAILND", callback: lsSET_RAIL, offset: 2 },
    { opcode: 0x86, command: "INVERSE_BETA", callback: lsINVERSE_BETA, offset: 0 },
    { opcode: 0x87, command: "NO_BODY", callback: lsNO_BODY, offset: 0 },
    { opcode: 0x88, command: "ADD_GOLD_PIECES", callback: lsADD_GOLD_PIECES, offset: 2 },
    { opcode: 0x89, command: "STOP_CURRENT_TRACK_OBJ", callback: lsSTOP_CURRENT_TRACK_OBJ, offset: 1 },
    { opcode: 0x8A, command: "RESTORE_LAST_TRACK_OBJ", callback: lsRESTORE_LAST_TRACK_OBJ, offset: 1 },
    { opcode: 0x8B, command: "SAVE_COMPORTEMENT_OBJ", callback: lsSAVE_COMPORTEMENT_OBJ, offset: 1 },
    { opcode: 0x8C, command: "RESTORE_COMPORTEMENT_OBJ", callback: lsRESTORE_COMPORTEMENT_OBJ, offset: 1 },
    { opcode: 0x8D, command: "SPY", callback: lsSPY, offset: 1 },
    { opcode: 0x8E, command: "DEBUG", callback: lsDEBUG, offset: 0 },
    { opcode: 0x8F, command: "DEBUG_OBJ", callback: lsDEBUG_OBJ, offset: 1 },
    { opcode: 0x90, command: "POPCORN", callback: lsPOPCORN, offset: 0 },
    { opcode: 0x91, command: "FLOW_POINT", callback: lsFLOW_POINT, offset: 2 },
    { opcode: 0x92, command: "FLOW_OBJ", callback: lsFLOW_OBJ, offset: 2 },
    { opcode: 0x93, command: "SET_ANIM_DIAL", callback: lsSET_ANIM_DIAL, offset: 2 },
    { opcode: 0x94, command: "PCX", callback: lsPCX, offset: 2 },
    { opcode: 0x95, command: "END_MESSAGE", callback: lsEND_MESSAGE, offset: 0 },
    { opcode: 0x96, command: "END_MESSAGE_OBJ", callback: lsEND_MESSAGE_OBJ, offset: 1 },
    { opcode: 0x97, command: "PARM_SAMPLE", callback: lsPARM_SAMPLE, offset: 5 }, // not sure about this one
    { opcode: 0x98, command: "NEW_SAMPLE", callback: lsNEW_SAMPLE, offset: 7 },
    { opcode: 0x99, command: "POS_OBJ_AROUND", callback: lsPOS_OBJ_AROUND, offset: 1 },
    { opcode: 0x9A, command: "PCX_MESS_OBJ", callback: lsPCX_MESS_OBJ, offset: 5 }
];

export const OperatorOpcode = [
    { opcode: 0x00, command: "==" },
    { opcode: 0x01, command: ">" },
    { opcode: 0x02, command: "<" },
    { opcode: 0x03, command: ">=" },
    { opcode: 0x04, command: "<=" },
    { opcode: 0x05, command: "!=" }
];

export const ConditionOpcode = [
    { opcode: 0x00, command: "COL", callback: lcCOL, param: 0, value_size: 1 },
    { opcode: 0x01, command: "COL_OBJ", callback: lcCOL_OBJ, param: 1, value_size: 1 },
    { opcode: 0x02, command: "DISTANCE", callback: lcDISTANCE, param: 1, value_size: 2 },
    { opcode: 0x03, command: "ZONE", callback: lcZONE, param: 0, value_size: 1 },
    { opcode: 0x04, command: "ZONE_OBJ", callback: lcZONE_OBJ, param: 1, value_size: 1 },
    { opcode: 0x05, command: "BODY", callback: lcBODY, param: 0, value_size: 1 },
    { opcode: 0x06, command: "BODY_OBJ", callback: lcBODY_OBJ, param: 1, value_size: 1 },
    { opcode: 0x07, command: "ANIM", callback: lcANIM, param: 0, value_size: 2 },
    { opcode: 0x08, command: "ANIM_OBJ", callback: lcANIM_OBJ, param: 1, value_size: 2 },
    { opcode: 0x09, command: "CURRENT_TRACK", callback: lcCURRENT_TRACK, param: 0, value_size: 1 },
    { opcode: 0x0A, command: "CURRENT_TRACK_OBJ", callback: lcCURRENT_TRACK_OBJ, param: 1, value_size: 1 },
    { opcode: 0x0B, command: "VAR_CUBE", callback: lcVAR_CUBE, param: 1, value_size: 1 },
    { opcode: 0x0C, command: "CONE_VIEW", callback: lcCONE_VIEW, param: 1, value_size: 2 },
    { opcode: 0x0D, command: "HIT_BY", callback: lcHIT_BY, param: 0, value_size: 1 },
    { opcode: 0x0E, command: "ACTION", callback: lcACTION, param: 0, value_size: 1 },
    { opcode: 0x0F, command: "VAR_GAME", callback: lcVAR_GAME, param: 1, value_size: 2 },
    { opcode: 0x10, command: "LIFE_POINT", callback: lcLIFE_POINT, param: 0, value_size: 2 },
    { opcode: 0x11, command: "LIFE_POINT_OBJ", callback: lcLIFE_POINT_OBJ, param: 1, value_size: 2 },
    { opcode: 0x12, command: "NUM_LITTLE_KEYS", callback: lcNUM_LITTLE_KEYS, param: 0, value_size: 1 },
    { opcode: 0x13, command: "NUM_GOLD_PIECES", callback: lcNUM_GOLD_PIECES, param: 0, value_size: 2 },
    { opcode: 0x14, command: "BEHAVIOUR", callback: lcBEHAVIOUR, param: 0, value_size: 1 },
    { opcode: 0x15, command: "CHAPTER", callback: lcCHAPTER, param: 0, value_size: 1 },
    { opcode: 0x16, command: "DISTANCE_3D", callback: lcDISTANCE_3D, param: 1, value_size: 1 },
    { opcode: 0x17, command: "MAGIC_LEVEL", callback: lcMAGIC_LEVEL, param: 0, value_size: 1 },
    { opcode: 0x18, command: "MAGIC_POINT", callback: lcMAGIC_POINT, param: 0, value_size: 1 },
    { opcode: 0x19, command: "USE_INVENTORY", callback: lcUSE_INVENTORY, param: 1, value_size: 1 },
    { opcode: 0x1A, command: "CHOICE", callback: lcCHOICE, param: 0, value_size: 2 },
    { opcode: 0x1B, command: "FUEL", callback: lcFUEL, param: 0, value_size: 1 },
    { opcode: 0x1C, command: "CARRIED_BY", callback: lcCARRIED_BY, param: 0, value_size: 1 },
    { opcode: 0x1D, command: "CDROM", callback: lcCDROM, param: 0, value_size: 1 },
    { opcode: 0x1E, command: "LADDER", callback: lcLADDER, param: 0, value_size: 1 },
    { opcode: 0x1F, command: "RND", callback: lcRND, param: 1, value_size: 1 },
    { opcode: 0x20, command: "RAIL", callback: lcRAIL, param: 1, value_size: 1 },
    { opcode: 0x21, command: "BETA", callback: lcBETA, param: 0, value_size: 2 },
    { opcode: 0x22, command: "BETA_OBJ", callback: lcBETA_OBJ, param: 1, value_size: 2 },
    { opcode: 0x23, command: "CARRIED_OBJ_BY", callback: lcCARRIED_OBJ_BY, param: 1, value_size: 1 },
    { opcode: 0x24, command: "ANGLE", callback: lcANGLE, param: 1, value_size: 2 },
    { opcode: 0x25, command: "DISTANCE_MESSAGE", callback: lcDISTANCE_MESSAGE, param: 1, value_size: 2 },
    { opcode: 0x26, command: "HIT_OBJ_BY", callback: lcHIT_OBJ_BY, param: 1, value_size: 1 },
    { opcode: 0x27, command: "REAL_ANGLE", callback: lcREAL_ANGLE, param: 0, value_size: 2 },
    { opcode: 0x28, command: "DEMO", callback: lcDEMO, param: 0, value_size: 1 },
    { opcode: 0x29, command: "COL_DECORS", callback: lcCOL_DECORS, param: 0, value_size: 1 },
    { opcode: 0x2A, command: "COL_DECORS_OBJ", callback: lcCOL_DECORS_OBJ, param: 1, value_size: 1 },
    { opcode: 0x2B, command: "PROCESSOR", callback: lcPROCESSOR, param: 0, value_size: 1 },
    { opcode: 0x2C, command: "OBJECT_DISPLAYED", callback: lcOBJECT_DISPLAYED, param: 0, value_size: 1 },
    { opcode: 0x2D, command: "ANGLE_OBJ", callback: lcANGLE_OBJ, param: 0, value_size: 1 }
];

// Condition Comands

function lcCOL(param) {

}

function lcCOL_OBJ(param) {

}

function lcDISTANCE(param) {

}

function lcZONE(param) {

}

function lcZONE_OBJ(param) {

}

function lcBODY(param) {

}

function lcBODY_OBJ(param) {

}

function lcANIM(param) {

}

function lcANIM_OBJ(param) {

}

function lcCURRENT_TRACK(param) {

}

function lcCURRENT_TRACK_OBJ(param) {

}

function lcVAR_CUBE(param) {

}

function lcCONE_VIEW(param) {

}

function lcHIT_BY(param) {

}

function lcACTION(param) {

}

function lcVAR_GAME(param) {

}

function lcLIFE_POINT(param) {

}

function lcLIFE_POINT_OBJ(param) {

}

function lcNUM_LITTLE_KEYS(param) {

}

function lcNUM_GOLD_PIECES(param) {

}

function lcBEHAVIOUR(param) {

}

function lcCHAPTER(param) {

}

function lcDISTANCE_3D(param) {

}

function lcMAGIC_LEVEL(param) {

}

function lcMAGIC_POINT(param) {

}

function lcUSE_INVENTORY(param) {

}

function lcCHOICE(param) {

}

function lcFUEL(param) {

}

function lcCARRIED_BY(param) {

}

function lcCDROM(param) {

}

function lcLADDER(param) {

}

function lcRND(param) {

}

function lcRAIL(param) {

}

function lcBETA(param) {

}

function lcBETA_OBJ(param) {

}

function lcCARRIED_OBJ_BY(param) {

}

function lcANGLE(param) {

}

function lcDISTANCE_MESSAGE(param) {

}

function lcHIT_OBJ_BY(param) {

}

function lcREAL_ANGLE(param) {

}

function lcDEMO(param) {

}

function lcCOL_DECORS(param) {

}

function lcCOL_DECORS_OBJ(param) {

}

function lcPROCESSOR(param) {

}

function lcOBJECT_DISPLAYED(param) {

}

function lcANGLE_OBJ(param) {

}

// Comands Conditions

function testConditionValue(operator, a, b) {
	switch (operator) {
        case 0:
            return a == b;
        case 1:
            return a > b;
        case 2:
            return a < b;
        case 3:
            return a >= b;
        case 4:
            return a <= b;
        case 5:
            return a != b;
        default:
            console.debug("Unknown operator");
	}
	return false;
}

function testCondition(script, state) {
    const conditionIndex = script.getUint8(state.offset++, true);
    const condition = ConditionOpcode[conditionIndex];
    let param = null; 
    if (condition.param) {
        param = script.getUint8(state.offset++, true);
    }
    const value1 = condition.callback(param);
    const operator = script.getUint8(state.offset++, true);
    let value2 = null;
    if (condition.value_size == 1) {
        value2 = script.getInt8(state.offset++, true);
    } else {
        value2 = script.getInt16(state.offset, true);
        state.offset += 2;
    }
    console.debug(condition + " " + value1 + " " + OperatorOpcode[operator] + " " + value2);
    return testConditionValue(operator, value1, value2);
}

// Life Script Comands

function lsEND(script, state, actor) {
    state.continue = false;
    state.offset = -1; // double check this later
}

function lsNOP(script, state, actor) {

}

function lsSNIF(script, state, actor) {
    if (!testCondition(script, state)) {
        script.offset = script.getUint16(state.opcodeOffset, 0x0D); // override opcode to SWIF
    }
    script.offset = script.getUint16(state.offset, true);
}

function lsOFFSET(script, state, actor) {
    script.offset = script.getUint16(state.offset, true);
}

function lsNEVERIF(script, state, actor) {
    testCondition(script, state);
    script.offset = script.getUint16(state.offset, true);
}

function lsPALETTE(script, state, actor) {

}

function lsRETURN(script, state, actor) {
    state.continue = false;
}

function lsIF(script, state, actor) {
    if (!testCondition(script, state)) {
        script.offset = script.getUint16(state.offset, true);
    }
    script.offset += 2;
}

function lsSWIF(script, state, actor) {
    if (!testCondition(script, state)) {
        script.offset = script.getUint16(state.offset, true);
    }
    script.offset += 2;
    script.offset = script.getUint16(state.opcodeOffset, 0x02); // override opcode to SNIF
}

function lsONEIF(script, state, actor) {
    if (!testCondition(script, state)) {
        script.offset = script.getUint16(state.offset, true);
    }
    script.offset += 2;
    script.offset = script.getUint16(state.opcodeOffset, 0x04); // override opcode to NEVERIF
}

function lsELSE(script, state, actor) {
    script.offset = script.getUint16(state.offset, true);
}

function lsENDIF(script, state, actor) {

}

function lsBODY(script, state, actor) {

}

function lsBODY_OBJ(script, state, actor) {

}

function lsANIM(script, state, actor) {

}

function lsANIM_OBJ(script, state, actor) {

}

function lsSET_CAMERA(script, state, actor) {

}

function lsCAMERA_CENTER(script, state, actor) {

}

function lsSET_TRACK(script, state, actor) {

}

function lsSET_TRACK_OBJ(script, state, actor) {

}

function lsMESSAGE(script, state, actor) {

}

function lsCAN_FALL(script, state, actor) {

}

function lsSET_DIRMODE(script, state, actor) {

}

function lsSET_DIRMODE_OBJ(script, state, actor) {

}

function lsCAM_FOLLOW(script, state, actor) {

}

function lsSET_BEHAVIOUR(script, state, actor) {

}

function lsSET_VAR_CUBE(script, state, actor) {

}

function lsCOMPORTEMENT(script, state, actor) {

}

function lsSET_COMPORTEMENT(script, state, actor) {

}

function lsSET_COMPORTEMENT_OBJ(script, state, actor) {

}

function lsEND_COMPORTEMENT(script, state, actor) {

}

function lsSET_VAR_GAME(script, state, actor) {

}

function lsKILL_OBJ(script, state, actor) {

}

function lsSUICIDE(script, state, actor) {

}

function lsUSE_ONE_LITTLE_KEY(script, state, actor) {

}

function lsGIVE_GOLD_PIECES(script, state, actor) {

}

function lsEND_LIFE(script, state, actor) {

}

function lsSTOP_CURRENT_TRACK(script, state, actor) {

}

function lsRESTORE_LAST_TRACK(script, state, actor) {

}

function lsMESSAGE_OBJ(script, state, actor) {

}

function lsINC_CHAPTER(script, state, actor) {

}

function lsFOUND_OBJECT(script, state, actor) {

}

function lsSET_DOOR_LEFT(script, state, actor) {

}

function lsSET_DOOR_RIGHT(script, state, actor) {

}

function lsSET_DOOR_UP(script, state, actor) {

}

function lsSET_DOOR_DOWN(script, state, actor) {

}

function lsGIVE_BONUS(script, state, actor) {

}

function lsCHANGE_CUBE(script, state, actor) {

}

function lsOBJ_COL(script, state, actor) {

}

function lsBRICK_COL(script, state, actor) {

}

function lsOR_IF(script, state, actor) {

}

function lsINVISIBLE(script, state, actor) {

}

function lsSHADOW_OBJ(script, state, actor) {

}

function lsPOS_POINT(script, state, actor) {

}

function lsSET_MAGIC_LEVEL(script, state, actor) {

}

function lsSUB_MAGIC_POINT(script, state, actor) {

}

function lsSET_LIFE_POINT_OBJ(script, state, actor) {

}

function lsSUB_LIFE_POINT_OBJ(script, state, actor) {

}

function lsHIT_OBJ(script, state, actor) {

}

function lsPLAY_ACF(script, state, actor) {

}

function lsECLAIR(script, state, actor) {

}

function lsINC_CLOVER_BOX(script, state, actor) {

}

function lsSET_USED_INVENTORY(script, state, actor) {

}

function lsADD_CHOICE(script, state, actor) {

}

function lsASK_CHOICE(script, state, actor) {

}

function lsINIT_BUGGY(script, state, actor) {

}

function lsMEMO_SLATE(script, state, actor) {

}

function lsSET_HOLO_POS(script, state, actor) {

}

function lsCLR_HOLO_POS(script, state, actor) {

}

function lsADD_FUEL(script, state, actor) {

}

function lsSUB_FUEL(script, state, actor) {

}

function lsSET_GRM(script, state, actor) {

}

function lsSET_CHANGE_CUBE(script, state, actor) {

}

function lsMESSAGE_ZOE(script, state, actor) {

}

function lsFULL_POINT(script, state, actor) {

}

function lsBETA(script, state, actor) {

}

function lsFADE_TO_PAL(script, state, actor) {

}

function lsACTION(script, state, actor) {

}

function lsSET_FRAME(script, state, actor) {

}

function lsSET_SPRITE(script, state, actor) {

}

function lsSET_FRAME_3DS(script, state, actor) {

}

function lsIMPACT_OBJ(script, state, actor) {

}

function lsIMPACT_POINT(script, state, actor) {

}

function lsADD_MESSAGE(script, state, actor) {

}

function lsBALLOON(script, state, actor) {

}

function lsNO_SHOCK(script, state, actor) {

}

function lsASK_CHOICE_OBJ(script, state, actor) {

}

function lsCINEMA_MODE(script, state, actor) {

}

function lsSAVE_HERO(script, state, actor) {

}

function lsRESTORE_HERO(script, state, actor) {

}

function lsANIM_SET(script, state, actor) {

}

function lsRAIN(script, state, actor) {

}

function lsGAME_OVER(script, state, actor) {

}

function lsTHE_END(script, state, actor) {

}

function lsESCALATOR(script, state, actor) {

}

function lsPLAY_MUSIC(script, state, actor) {

}

function lsTRACK_TO_VAR_GAME(script, state, actor) {

}

function lsVAR_GAME_TO_TRACK(script, state, actor) {

}

function lsANIM_TEXTURE(script, state, actor) {

}

function lsADD_MESSAGE_OBJ(script, state, actor) {

}

function lsBRUTAL_EXIT(script, state, actor) {
    state.continue = false;
    state.offset = -1;
}

function lsREPLACE(script, state, actor) {

}

function lsSCALE(script, state, actor) {

}

function lsSET_ARMOR(script, state, actor) {

}

function lsSET_ARMOR_OBJ(script, state, actor) {

}

function lsADD_LIFE_POINT_OBJ(script, state, actor) {

}

function lsSTATE_INVENTORY(script, state, actor) {

}

function lsAND_IF(script, state, actor) {

}

function lsSWITCH(script, state, actor) {

}

function lsOR_CASE(script, state, actor) {

}

function lsCASE(script, state, actor) {

}

function lsDEFAULT(script, state, actor) {

}

function lsBREAK(script, state, actor) {

}

function lsEND_SWITCH(script, state, actor) {

}

function lsSET_HIT_ZONE(script, state, actor) {

}

function lsSAVE_COMPORTEMENT(script, state, actor) {

}

function lsRESTORE_COMPORTEMENT(script, state, actor) {

}

function lsSAMPLE(script, state, actor) {

}

function lsSAMPLE_RND(script, state, actor) {

}

function SAMPLE_ALWAYS(script, state, actor) {

}

function lsSAMPLE_STOP(script, state, actor) {

}

function lsREPEAT_SAMPLE(script, state, actor) {

}

function lsBACKGROUND(script, state, actor) {

}

function lsADD_VAR_GAME(script, state, actor) {

}

function lsSUB_VAR_GAME(script, state, actor) {

}

function lsADD_VAR_CUBE(script, state, actor) {

}

function lsSUB_VAR_CUBE(script, state, actor) {

}

function lsSET_RAIL(script, state, actor) {

}

function lsINVERSE_BETA(script, state, actor) {

}

function lsNO_BODY(script, state, actor) {

}

function lsADD_GOLD_PIECES(script, state, actor) {

}

function lsSTOP_CURRENT_TRACK_OBJ(script, state, actor) {

}

function lsRESTORE_LAST_TRACK_OBJ(script, state, actor) {

}

function lsSAVE_COMPORTEMENT_OBJ(script, state, actor) {

}

function lsRESTORE_COMPORTEMENT_OBJ(script, state, actor) {

}

function lsSPY(script, state, actor) {

}

function lsDEBUG(script, state, actor) {

}

function lsDEBUG_OBJ(script, state, actor) {

}

function lsPOPCORN(script, state, actor) {

}

function lsFLOW_POINT(script, state, actor) {

}

function lsFLOW_OBJ(script, state, actor) {

}

function lsSET_ANIM_DIAL(script, state, actor) {

}

function lsPCX(script, state, actor) {

}

function lsEND_MESSAGE(script, state, actor) {

}

function lsEND_MESSAGE_OBJ(script, state, actor) {

}

function lsPARM_SAMPLE(script, state, actor) {

}

function lsNEW_SAMPLE(script, state, actor) {

}

function lsPOS_OBJ_AROUND(script, state, actor) {

}

function lsPCX_MESS_OBJ(script, state, actor) {

}
