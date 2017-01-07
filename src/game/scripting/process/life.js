import {ActorStaticFlags} from '../../actors';
import {setStaticFlag} from '../../../utils/lba';


export function NOP(script, state, actor) {

}

export function PALETTE(script, state, actor) {

}

export function BODY(script, state, actor) {

}

export function BODY_OBJ(script, state, actor) {

}

export function ANIM(script, state, actor) {

}

export function ANIM_OBJ(script, state, actor) {

}

export function SET_CAMERA(script, state, actor) {

}

export function CAMERA_CENTER(script, state, actor) {

}

export function SET_TRACK(script, state, actor) {

}

export function SET_TRACK_OBJ(script, state, actor) {

}

export function MESSAGE(script, state, actor) {

}

export function CAN_FALL(script, state, actor) {

}

export function SET_DIRMODE(script, state, actor) {
    const dirMode = script.getUint8(state.offset, true);
    if (dirMode == 2 || dirMode == 4) { // TODO add dirMode enumeration here
        const actorIndex = script.getUint8(state.offset + 1, true);
        state.offset++;
        // TODO implementation
    }
}

export function SET_DIRMODE_OBJ(script, state, actor) {
    const actorIndex1 = script.getUint8(state.offset, true);
    const dirMode = script.getUint8(state.offset + 1, true);
    if (dirMode == 2 || dirMode == 4) { // TODO add dirMode enumeration here
        const actorIndex2 = script.getUint8(state.offset + 2, true);
        state.offset++;
        // TODO implementation
    }
}

export function CAM_FOLLOW(script, state, actor) {

}

export function SET_BEHAVIOUR(script, state, actor) {

}

export function SET_VAR_CUBE(script, state, actor) {

}

export function SET_VAR_GAME(script, state, actor) {

}

export function KILL_OBJ(script, state, actor) {

}

export function SUICIDE(script, state, actor) {

}

export function USE_ONE_LITTLE_KEY(script, state, actor) {

}

export function GIVE_GOLD_PIECES(script, state, actor) {

}

export function END_LIFE(script, state, actor) {
    state.reentryOffset = -1;
    state.continue = false;
}

export function STOP_CURRENT_TRACK(script, state, actor) {

}

export function RESTORE_LAST_TRACK(script, state, actor) {

}

export function MESSAGE_OBJ(script, state, actor) {

}

export function INC_CHAPTER(script, state, actor) {

}

export function FOUND_OBJECT(script, state, actor) {

}

export function SET_DOOR_LEFT(script, state, actor) {

}

export function SET_DOOR_RIGHT(script, state, actor) {

}

export function SET_DOOR_UP(script, state, actor) {

}

export function SET_DOOR_DOWN(script, state, actor) {

}

export function GIVE_BONUS(script, state, actor) {

}

export function CHANGE_CUBE(script, state, actor) {

}

export function OBJ_COL(script, state, actor) {

}

export function BRICK_COL(script, state, actor) {

}

export function INVISIBLE(script, state, actor) {
    const isActive = script.getUint8(state.offset, true);
    //actor.props.staticFlags = setStaticFlag(actor.props.staticFlags, ActorStaticFlags.HIDDEN, isActive);
}

export function SHADOW_OBJ(script, state, actor) {

}

export function POS_POINT(script, state, actor) {

}

export function SET_MAGIC_LEVEL(script, state, actor) {

}

export function SUB_MAGIC_POINT(script, state, actor) {

}

export function SET_LIFE_POINT_OBJ(script, state, actor) {

}

export function SUB_LIFE_POINT_OBJ(script, state, actor) {

}

export function HIT_OBJ(script, state, actor) {

}

export function PLAY_ACF(script, state, actor) {

}

export function ECLAIR(script, state, actor) {

}

export function INC_CLOVER_BOX(script, state, actor) {

}

export function SET_USED_INVENTORY(script, state, actor) {

}

export function ADD_CHOICE(script, state, actor) {

}

export function ASK_CHOICE(script, state, actor) {

}

export function INIT_BUGGY(script, state, actor) {

}

export function MEMO_SLATE(script, state, actor) {

}

export function SET_HOLO_POS(script, state, actor) {

}

export function CLR_HOLO_POS(script, state, actor) {

}

export function ADD_FUEL(script, state, actor) {

}

export function SUB_FUEL(script, state, actor) {

}

export function SET_GRM(script, state, actor) {

}

export function SET_CHANGE_CUBE(script, state, actor) {

}

export function MESSAGE_ZOE(script, state, actor) {

}

export function FULL_POINT(script, state, actor) {

}

export function BETA(script, state, actor) {

}

export function FADE_TO_PAL(script, state, actor) {

}

export function ACTION(script, state, actor) {

}

export function SET_FRAME(script, state, actor) {

}

export function SET_SPRITE(script, state, actor) {

}

export function SET_FRAME_3DS(script, state, actor) {

}

export function IMPACT_OBJ(script, state, actor) {

}

export function IMPACT_POINT(script, state, actor) {

}

export function ADD_MESSAGE(script, state, actor) {

}

export function BALLOON(script, state, actor) {

}

export function NO_SHOCK(script, state, actor) {

}

export function ASK_CHOICE_OBJ(script, state, actor) {

}

export function CINEMA_MODE(script, state, actor) {

}

export function SAVE_HERO(script, state, actor) {

}

export function RESTORE_HERO(script, state, actor) {

}

export function ANIM_SET(script, state, actor) {

}

export function RAIN(script, state, actor) {

}

export function GAME_OVER(script, state, actor) {

}

export function THE_END(script, state, actor) {

}

export function ESCALATOR(script, state, actor) {

}

export function PLAY_MUSIC(script, state, actor) {

}

export function TRACK_TO_VAR_GAME(script, state, actor) {

}

export function VAR_GAME_TO_TRACK(script, state, actor) {

}

export function ANIM_TEXTURE(script, state, actor) {

}

export function ADD_MESSAGE_OBJ(script, state, actor) {

}

export function BRUTAL_EXIT(script, state, actor) {
    state.continue = false;
    state.offset = -1;
}

export function REPLACE(script, state, actor) {

}

export function SCALE(script, state, actor) {

}

export function SET_ARMOR(script, state, actor) {

}

export function SET_ARMOR_OBJ(script, state, actor) {

}

export function ADD_LIFE_POINT_OBJ(script, state, actor) {

}

export function STATE_INVENTORY(script, state, actor) {

}

export function SET_HIT_ZONE(script, state, actor) {

}

export function SAVE_COMPORTEMENT(script, state, actor) {

}

export function RESTORE_COMPORTEMENT(script, state, actor) {

}

export function SAMPLE(script, state, actor) {

}

export function SAMPLE_RND(script, state, actor) {

}

export function SAMPLE_ALWAYS(script, state, actor) {

}

export function SAMPLE_STOP(script, state, actor) {

}

export function REPEAT_SAMPLE(script, state, actor) {

}

export function BACKGROUND(script, state, actor) {

}

export function ADD_VAR_GAME(script, state, actor) {

}

export function SUB_VAR_GAME(script, state, actor) {

}

export function ADD_VAR_CUBE(script, state, actor) {

}

export function SUB_VAR_CUBE(script, state, actor) {

}

export function SET_RAIL(script, state, actor) {

}

export function INVERSE_BETA(script, state, actor) {

}

export function NO_BODY(script, state, actor) {

}

export function ADD_GOLD_PIECES(script, state, actor) {

}

export function STOP_CURRENT_TRACK_OBJ(script, state, actor) {

}

export function RESTORE_LAST_TRACK_OBJ(script, state, actor) {

}

export function SAVE_COMPORTEMENT_OBJ(script, state, actor) {

}

export function RESTORE_COMPORTEMENT_OBJ(script, state, actor) {

}

export function SPY(script, state, actor) {

}

export function DEBUG(script, state, actor) {

}

export function DEBUG_OBJ(script, state, actor) {

}

export function POPCORN(script, state, actor) {

}

export function FLOW_POINT(script, state, actor) {

}

export function FLOW_OBJ(script, state, actor) {

}

export function SET_ANIM_DIAL(script, state, actor) {

}

export function PCX(script, state, actor) {

}

export function END_MESSAGE(script, state, actor) {

}

export function END_MESSAGE_OBJ(script, state, actor) {

}

export function PARM_SAMPLE(script, state, actor) {

}

export function NEW_SAMPLE(script, state, actor) {

}

export function POS_OBJ_AROUND(script, state, actor) {

}

export function PCX_MESS_OBJ(script, state, actor) {

}

