import async from 'async';

export const MoveOpcode = [
    { opcode: 0x00, command: "END", callback: msEND, offset: 0 },
    { opcode: 0x01, command: "NOP", callback: msNOP, offset: 0 },
    { opcode: 0x02, command: "BODY", callback: msBODY, offset: 1 },
    { opcode: 0x03, command: "ANIM", callback: msANIM, offset: 2 },
    { opcode: 0x04, command: "GOTO_POINT", callback: msGOTO_POINT, offset: 1 },
    { opcode: 0x05, command: "WAIT_ANIM", callback: msWAIT_ANIM, offset: 0 },
    { opcode: 0x06, command: "LOOP", callback: null, offset: 0 },
    { opcode: 0x07, command: "ANGLE", callback: msANGLE, offset: 2 },
    { opcode: 0x08, command: "POS_POINT", callback: msPOS_POINT, offset: 1 },
    { opcode: 0x09, command: "LABEL", callback: msLABEL, offset: 1 },
    { opcode: 0x0A, command: "GOTO", callback: msGOTO, offset: 2 },
    { opcode: 0x0B, command: "STOP", callback: msSTOP, offset: 0 },
    { opcode: 0x0C, command: "GOTO_SYM_POINT", callback: msGOTO_SYM_POINT, offset: 1 },
    { opcode: 0x0D, command: "WAIT_NUM_ANIM", callback: msWAIT_NUM_ANIM, offset: 1 },
    { opcode: 0x0E, command: "SAMPLE", callback: msSAMPLE, offset: 2 },
    { opcode: 0x0F, command: "GOTO_POINT_3D", callback: msGOTO_POINT_3D, offset: 1 },
    { opcode: 0x10, command: "SPEED", callback: msSPEED, offset: 2 },
    { opcode: 0x11, command: "BACKGROUND", callback: msBACKGROUND, offset: 1 },
    { opcode: 0x12, command: "WAIT_NUM_SECOND", callback: msWAIT_NUM_SECOND, offset: 5 },
    { opcode: 0x13, command: "NO_BODY", callback: msNO_BODY, offset: 0 },
    { opcode: 0x14, command: "BETA", callback: msBETA, offset: 2 },
    { opcode: 0x15, command: "OPEN_LEFT", callback: msOPEN_LEFT, offset: 2 },
    { opcode: 0x16, command: "OPEN_RIGHT", callback: msOPEN_RIGHT, offset: 2 },
    { opcode: 0x17, command: "OPEN_UP", callback: msOPEN_UP, offset: 2 },
    { opcode: 0x18, command: "OPEN_DOWN", callback: msOPEN_DOWN, offset: 2 },
    { opcode: 0x19, command: "CLOSE", callback: msCLOSE, offset: 0 },
    { opcode: 0x1A, command: "WAIT_DOOR", callback: msWAIT_DOOR, offset: 0 },
    { opcode: 0x1B, command: "SAMPLE_RND", callback: msSAMPLE_RND, offset: 2 },
    { opcode: 0x1C, command: "SAMPLE_ALWAYS", callback: msSAMPLE_ALWAYS, offset: 2 },
    { opcode: 0x1D, command: "SAMPLE_STOP", callback: msSAMPLE_STOP, offset: 2 },
    { opcode: 0x1E, command: "PLAY_ACF", callback: msPLAY_ACF, offset: 0 },
    { opcode: 0x1F, command: "REPEAT_SAMPLE", callback: msREPEAT_SAMPLE, offset: 2 },
    { opcode: 0x20, command: "SIMPLE_SAMPLE", callback: msSIMPLE_SAMPLE, offset: 2 },
    { opcode: 0x21, command: "FACE_HERO", callback: msFACE_HERO, offset: 2 },
    { opcode: 0x22, command: "ANGLE_RND", callback: msANGLE_RND, offset: 4 },
    { opcode: 0x23, command: "REPLACE", callback: msREPLACE, offset: 0 },
    { opcode: 0x24, command: "WAIT_NUM_DECIMAL", callback: msWAIT_NUM_DECIMAL, offset: 5 },
    { opcode: 0x25, command: "DO", callback: null, offset: 0 },
    { opcode: 0x26, command: "SPRITE", callback: msSPRITE, offset: 2 },
    { opcode: 0x27, command: "WAIT_NUM_SECOND_RND", callback: msWAIT_NUM_SECOND_RND, offset: 5 },
    { opcode: 0x28, command: "AFF_TIMER", callback: null, offset: 0 },
    { opcode: 0x29, command: "SET_FRAME", callback: msSET_FRAME, offset: 1 },
    { opcode: 0x2A, command: "SET_FRAME_3DS", callback: msSET_FRAME_3DS, offset: 1 },
    { opcode: 0x2B, command: "SET_START_3DS", callback: msSET_START_3DS, offset: 1 },
    { opcode: 0x2C, command: "SET_END_3DS", callback: msSET_END_3DS, offset: 1 },
    { opcode: 0x2D, command: "START_ANIM_3DS", callback: msSTART_ANIM_3DS, offset: 1 },
    { opcode: 0x2E, command: "STOP_ANIM_3DS", callback: msSTOP_ANIM_3DS, offset: 0 },
    { opcode: 0x2F, command: "WAIT_ANIM_3DS", callback: msWAIT_ANIM_3DS, offset: 0 },
    { opcode: 0x30, command: "WAIT_FRAME_3DS", callback: msWAIT_FRAME_3DS, offset: 0 },
    { opcode: 0x31, command: "WAIT_NUM_DECIMAL_RND", callback: msWAIT_NUM_DECIMAL_RND, offset: 5 },
    { opcode: 0x32, command: "INTERVAL", callback: msINTERVAL, offset: 2 },
    { opcode: 0x33, command: "FREQUENCY", callback: msFREQUENCY, offset: 2 },
    { opcode: 0x34, command: "VOLUME", callback: msVOLUME, offset: 1 }
];

function msEND(script, state, actor) {
    state.continue = false;
}

function msNOP(script, state, actor) {
    
}

function msBODY(script, state, actor) {
    actor.bodyIndex = script.getUint8(state.offset, true);
}

function msANIM(script, state, actor) {
    actor.animIndex = script.getUint8(state.offset, true);
}

function msGOTO_POINT(script, state, actor) {
    
}

function msWAIT_ANIM(script, state, actor) {
    
}

function msANGLE(script, state, actor) {
    
}

function msPOS_POINT(script, state, actor) {
    
}

function msLABEL(script, state, actor) {
    
}

function msGOTO(script, state, actor) {
    //state.offset = script.getInt16(state.offset, true);
}

function msSTOP(script, state, actor) {
    state.continue = false;
    state.offset = -1;
}

function msGOTO_SYM_POINT(script, state, actor) {
    
}

function msWAIT_NUM_ANIM(script, state, actor) {
    
}

function msSAMPLE(script, state, actor) {
    
}

function msGOTO_POINT_3D(script, state, actor) {
    
}

function msSPEED(script, state, actor) {
    
}

function msBACKGROUND(script, state, actor) {
    
}

function msWAIT_NUM_SECOND(script, state, actor) {
    
}

function msNO_BODY(script, state, actor) {
    actor.visible = false;
}

function msBETA(script, state, actor) {
    
}

function msOPEN_LEFT(script, state, actor) {
    
}

function msOPEN_RIGHT(script, state, actor) {
    
}

function msOPEN_UP(script, state, actor) {
    
}

function msOPEN_DOWN(script, state, actor) {
    
}

function msCLOSE(script, state, actor) {
    
}

function msWAIT_DOOR(script, state, actor) {
    
}

function msSAMPLE_RND(script, state, actor) {
    
}

function msSAMPLE_ALWAYS(script, state, actor) {
    
}

function msSAMPLE_STOP(script, state, actor) {
    
}

function msPLAY_ACF(script, state, actor) {
    
}

function msREPEAT_SAMPLE(script, state, actor) {
    
}

function msSIMPLE_SAMPLE(script, state, actor) {
    
}

function msFACE_HERO(script, state, actor) {
    
}

function msANGLE_RND(script, state, actor) {
    
}

function msREPLACE(script, state, actor) {
    
}

function msWAIT_NUM_DECIMAL(script, state, actor) {
    
}

function msSPRITE(script, state, actor) {
    
}

function msWAIT_NUM_SECOND_RND(script, state, actor) {
    
}

function msSET_FRAME(script, state, actor) {
    
}

function msSET_FRAME_3DS(script, state, actor) {
    
}

function msSET_START_3DS(script, state, actor) {
    
}

function msSET_END_3DS(script, state, actor) {
    
}

function msSTART_ANIM_3DS(script, state, actor) {
    
}

function msSTOP_ANIM_3DS(script, state, actor) {
    
}

function msWAIT_ANIM_3DS(script, state, actor) {
    
}

function msWAIT_FRAME_3DS(script, state, actor) {
    
}

function msWAIT_NUM_DECIMAL_RND(script, state, actor) {
    
}

function msINTERVAL(script, state, actor) {
    
}

function msFREQUENCY(script, state, actor) {
    
}

function msVOLUME(script, state, actor) {
    
}
