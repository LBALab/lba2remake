import {ActorStaticFlags} from '../../actors';
import {setStaticFlag} from '../../../utils/lba';


export function NOP(game, script, state, actor) {

}

export function PALETTE(game, script, state, actor) {

}

export function BODY(game, script, state, actor) {

}

export function BODY_OBJ(game, script, state, actor) {

}

export function ANIM(game, script, state, actor) {

}

export function ANIM_OBJ(game, script, state, actor) {

}

export function SET_CAMERA(game, script, state, actor) {

}

export function CAMERA_CENTER(game, script, state, actor) {

}

export function SET_TRACK(game, script, state, actor) {
    state.move.reentryOffset = script.getUint16(state.life.offset, true);
}

export function SET_TRACK_OBJ(game, script, state, actor) {
    const actorIndex = script.getUint8(state.life.offset, true);
    const reentryOffsetActor = script.getUint16(state.life.offset + 1, true);
    const actorOther = game.getSceneManager().getScene(state.life.sceneIndex).getActor(actorIndex);
    if (actorOther) {
        actorOther.scriptState.move.reentryOffset = reentryOffsetActor;
    }
}

export function MESSAGE(game, script, state, actor) {

}

export function CAN_FALL(game, script, state, actor) {

}

export function SET_DIRMODE(game, script, state, actor) {
    const dirMode = script.getUint8(state.life.offset, true);
    if (dirMode == 2 || dirMode == 4 || dirMode == 6) { // TODO add dirMode enumeration here
        const actorIndex = script.getUint8(state.life.offset + 1, true);
        state.life.offset++;
        // TODO implementation
    }
}

export function SET_DIRMODE_OBJ(game, script, state, actor) {
    const actorIndex1 = script.getUint8(state.life.offset, true);
    const dirMode = script.getUint8(state.life.offset + 1, true);
    if (dirMode == 2 || dirMode == 4 || dirMode == 6) { // TODO add dirMode enumeration here
        const actorIndex2 = script.getUint8(state.life.offset + 2, true);
        state.life.offset++;
        // TODO implementation
    }
}

export function CAM_FOLLOW(game, script, state, actor) {

}

export function SET_BEHAVIOUR(game, script, state, actor) {

}

export function SET_VAR_CUBE(game, script, state, actor) {

}

export function SET_VAR_GAME(game, script, state, actor) {

}

export function KILL_OBJ(game, script, state, actor) {

}

export function SUICIDE(game, script, state, actor) {

}

export function USE_ONE_LITTLE_KEY(game, script, state, actor) {

}

export function GIVE_GOLD_PIECES(game, script, state, actor) {

}

export function END_LIFE(game, script, state, actor) {
    state.life.reentryOffset = -1;
    state.life.continue = false;
}

export function STOP_CURRENT_TRACK(game, script, state, actor) {
    state.move.savedOffset = state.move.trackOffset;
    state.move.reentryOffset = -1;
}

export function RESTORE_LAST_TRACK(game, script, state, actor) {
    state.move.reentryOffset = state.move.savedOffset;
}

export function MESSAGE_OBJ(game, script, state, actor) {

}

export function INC_CHAPTER(game, script, state, actor) {

}

export function FOUND_OBJECT(game, script, state, actor) {

}

export function SET_DOOR_LEFT(game, script, state, actor) {

}

export function SET_DOOR_RIGHT(game, script, state, actor) {

}

export function SET_DOOR_UP(game, script, state, actor) {

}

export function SET_DOOR_DOWN(game, script, state, actor) {

}

export function GIVE_BONUS(game, script, state, actor) {

}

export function CHANGE_CUBE(game, script, state, actor) {

}

export function OBJ_COL(game, script, state, actor) {

}

export function BRICK_COL(game, script, state, actor) {

}

export function INVISIBLE(game, script, state, actor) {
    const isActive = script.getUint8(state.life.offset, true);
    //actor.props.staticFlags = setStaticFlag(actor.props.staticFlags, ActorStaticFlags.HIDDEN, isActive);
}

export function SHADOW_OBJ(game, script, state, actor) {

}

export function POS_POINT(game, script, state, actor) {

}

export function SET_MAGIC_LEVEL(game, script, state, actor) {

}

export function SUB_MAGIC_POINT(game, script, state, actor) {

}

export function SET_LIFE_POINT_OBJ(game, script, state, actor) {

}

export function SUB_LIFE_POINT_OBJ(game, script, state, actor) {

}

export function HIT_OBJ(game, script, state, actor) {

}

export function PLAY_SMK(game, script, state, actor) {

}

export function ECLAIR(game, script, state, actor) {

}

export function INC_CLOVER_BOX(game, script, state, actor) {

}

export function SET_USED_INVENTORY(game, script, state, actor) {

}

export function ADD_CHOICE(game, script, state, actor) {

}

export function ASK_CHOICE(game, script, state, actor) {

}

export function INIT_BUGGY(game, script, state, actor) {

}

export function MEMO_SLATE(game, script, state, actor) {

}

export function SET_HOLO_POS(game, script, state, actor) {

}

export function CLR_HOLO_POS(game, script, state, actor) {

}

export function ADD_FUEL(game, script, state, actor) {

}

export function SUB_FUEL(game, script, state, actor) {

}

export function SET_GRM(game, script, state, actor) {

}

export function SET_CHANGE_CUBE(game, script, state, actor) {

}

export function MESSAGE_ZOE(game, script, state, actor) {

}

export function FULL_POINT(game, script, state, actor) {

}

export function BETA(game, script, state, actor) {

}

export function FADE_TO_PAL(game, script, state, actor) {

}

export function ACTION(game, script, state, actor) {

}

export function SET_FRAME(game, script, state, actor) {

}

export function SET_SPRITE(game, script, state, actor) {

}

export function SET_FRAME_3DS(game, script, state, actor) {

}

export function IMPACT_OBJ(game, script, state, actor) {

}

export function IMPACT_POINT(game, script, state, actor) {

}

export function ADD_MESSAGE(game, script, state, actor) {

}

export function BALLOON(game, script, state, actor) {

}

export function NO_SHOCK(game, script, state, actor) {

}

export function ASK_CHOICE_OBJ(game, script, state, actor) {

}

export function CINEMA_MODE(game, script, state, actor) {

}

export function SAVE_HERO(game, script, state, actor) {

}

export function RESTORE_HERO(game, script, state, actor) {

}

export function ANIM_SET(game, script, state, actor) {

}

export function RAIN(game, script, state, actor) {

}

export function GAME_OVER(game, script, state, actor) {

}

export function THE_END(game, script, state, actor) {

}

export function ESCALATOR(game, script, state, actor) {

}

export function PLAY_MUSIC(game, script, state, actor) {

}

export function TRACK_TO_VAR_GAME(game, script, state, actor) {

}

export function VAR_GAME_TO_TRACK(game, script, state, actor) {

}

export function ANIM_TEXTURE(game, script, state, actor) {

}

export function ADD_MESSAGE_OBJ(game, script, state, actor) {

}

export function BRUTAL_EXIT(game, script, state, actor) {
    state.life.continue = false;
    state.life.offset = -1;
}

export function REPLACE(game, script, state, actor) {

}

export function SCALE(game, script, state, actor) {

}

export function SET_ARMOR(game, script, state, actor) {

}

export function SET_ARMOR_OBJ(game, script, state, actor) {

}

export function ADD_LIFE_POINT_OBJ(game, script, state, actor) {

}

export function STATE_INVENTORY(game, script, state, actor) {

}

export function SET_HIT_ZONE(game, script, state, actor) {

}

export function SAVE_COMPORTEMENT(game, script, state, actor) {

}

export function RESTORE_COMPORTEMENT(game, script, state, actor) {

}

export function SAMPLE(game, script, state, actor) {

}

export function SAMPLE_RND(game, script, state, actor) {

}

export function SAMPLE_ALWAYS(game, script, state, actor) {

}

export function SAMPLE_STOP(game, script, state, actor) {

}

export function REPEAT_SAMPLE(game, script, state, actor) {

}

export function BACKGROUND(game, script, state, actor) {

}

export function ADD_VAR_GAME(game, script, state, actor) {

}

export function SUB_VAR_GAME(game, script, state, actor) {

}

export function ADD_VAR_CUBE(game, script, state, actor) {

}

export function SUB_VAR_CUBE(game, script, state, actor) {

}

export function SET_RAIL(game, script, state, actor) {

}

export function INVERSE_BETA(game, script, state, actor) {

}

export function NO_BODY(game, script, state, actor) {

}

export function ADD_GOLD_PIECES(game, script, state, actor) {

}

export function STOP_CURRENT_TRACK_OBJ(game, script, state, actor) {

}

export function RESTORE_LAST_TRACK_OBJ(game, script, state, actor) {

}

export function SAVE_COMPORTEMENT_OBJ(game, script, state, actor) {

}

export function RESTORE_COMPORTEMENT_OBJ(game, script, state, actor) {

}

export function SPY(game, script, state, actor) {

}

export function DEBUG(game, script, state, actor) {

}

export function DEBUG_OBJ(game, script, state, actor) {

}

export function POPCORN(game, script, state, actor) {

}

export function FLOW_POINT(game, script, state, actor) {

}

export function FLOW_OBJ(game, script, state, actor) {

}

export function SET_ANIM_DIAL(game, script, state, actor) {

}

export function PCX(game, script, state, actor) {

}

export function END_MESSAGE(game, script, state, actor) {

}

export function END_MESSAGE_OBJ(game, script, state, actor) {

}

export function PARM_SAMPLE(game, script, state, actor) {

}

export function NEW_SAMPLE(game, script, state, actor) {

}

export function POS_OBJ_AROUND(game, script, state, actor) {

}

export function PCX_MESS_OBJ(game, script, state, actor) {

}

