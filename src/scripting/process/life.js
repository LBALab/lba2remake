import {ActorStaticFlags} from '../../game/actors';
import {setStaticFlag} from '../../utils/lba';

export function PALETTE() {

}

export function BODY() {

}

export function BODY_OBJ() {

}

export function ANIM() {

}

export function ANIM_OBJ() {

}

export function SET_CAMERA() {

}

export function CAMERA_CENTER() {

}

export function MESSAGE() {

}

export function CAN_FALL() {

}

export function SET_DIRMODE(state, dirmode) {

}

export function SET_DIRMODE_OBJ() {

}

export function CAM_FOLLOW() {

}

export function SET_BEHAVIOUR() {

}

export function SET_VAR_CUBE() {

}

export function SET_VAR_GAME(index, value) {
    this.game.getState().flags.quest[index] = value;
}

export function KILL_OBJ() {

}

export function SUICIDE() {
    if (this.actor.threeObject) {
        this.actor.movel = null;
        this.actor.threeObject.visible = false;
        this.actor.threeObject = null;
    }
    BRUTAL_EXIT.call(this);
}

export function USE_ONE_LITTLE_KEY() {

}

export function GIVE_GOLD_PIECES() {

}

export function END_LIFE() {
    BRUTAL_EXIT.call(this);
}

export function MESSAGE_OBJ() {

}

export function INC_CHAPTER() {

}

export function FOUND_OBJECT() {

}

export function SET_DOOR_LEFT() {

}

export function SET_DOOR_RIGHT() {

}

export function SET_DOOR_UP() {

}

export function SET_DOOR_DOWN() {

}

export function GIVE_BONUS() {

}

export function CHANGE_CUBE() {

}

export function OBJ_COL() {

}

export function BRICK_COL() {

}

export function INVISIBLE(enabled) {
    const actorProps = this.actor.props;
    //actorProps.staticFlags = setStaticFlag(actorProps.staticFlags, ActorStaticFlags.HIDDEN, enabled);
}

export function SHADOW_OBJ() {

}

export function SET_MAGIC_LEVEL() {

}

export function SUB_MAGIC_POINT() {

}

export function SET_LIFE_POINT_OBJ() {

}

export function SUB_LIFE_POINT_OBJ() {

}

export function HIT_OBJ() {

}

export function PLAY_SMK() {

}

export function ECLAIR() {

}

export function INC_CLOVER_BOX() {

}

export function SET_USED_INVENTORY() {

}

export function ADD_CHOICE() {

}

export function ASK_CHOICE() {

}

export function INIT_BUGGY() {

}

export function MEMO_SLATE() {

}

export function SET_HOLO_POS() {

}

export function CLR_HOLO_POS() {

}

export function ADD_FUEL() {

}

export function SUB_FUEL() {

}

export function SET_GRM() {

}

export function SET_CHANGE_CUBE() {

}

export function MESSAGE_ZOE() {

}

export function FULL_POINT() {

}

export function BETA() {

}

export function FADE_TO_PAL() {

}

export function ACTION() {

}

export function SET_FRAME() {

}

export function SET_SPRITE() {

}

export function SET_FRAME_3DS() {

}

export function IMPACT_OBJ() {

}

export function IMPACT_POINT() {

}

export function ADD_MESSAGE() {

}

export function BALLOON() {

}

export function NO_SHOCK() {

}

export function ASK_CHOICE_OBJ() {

}

export function CINEMA_MODE() {

}

export function SAVE_HERO() {

}

export function RESTORE_HERO() {

}

export function ANIM_SET() {

}

export function RAIN() {

}

export function GAME_OVER() {

}

export function THE_END() {

}

export function ESCALATOR() {

}

export function PLAY_MUSIC() {

}

export function TRACK_TO_VAR_GAME() {

}

export function VAR_GAME_TO_TRACK() {

}

export function ANIM_TEXTURE() {

}

export function ADD_MESSAGE_OBJ() {

}

export function BRUTAL_EXIT() {
    this.state.continue = false;
    this.state.terminated = true;
    this.moveState.terminated = true;
}

export function REPLACE() {

}

export function SCALE() {

}

export function SET_ARMOR() {

}

export function SET_ARMOR_OBJ() {

}

export function ADD_LIFE_POINT_OBJ() {

}

export function STATE_INVENTORY() {

}

export function SET_HIT_ZONE() {

}

export function SAMPLE() {

}

export function SAMPLE_RND() {

}

export function SAMPLE_ALWAYS() {

}

export function SAMPLE_STOP() {

}

export function REPEAT_SAMPLE() {

}

export function BACKGROUND() {

}

export function ADD_VAR_GAME() {

}

export function SUB_VAR_GAME() {

}

export function ADD_VAR_CUBE() {

}

export function SUB_VAR_CUBE() {

}

export function SET_RAIL() {

}

export function INVERSE_BETA() {

}

export function NO_BODY() {

}

export function ADD_GOLD_PIECES() {

}

export function STOP_CURRENT_TRACK_OBJ() {

}

export function RESTORE_LAST_TRACK_OBJ() {

}

export function SAVE_COMPORTEMENT_OBJ() {

}

export function RESTORE_COMPORTEMENT_OBJ() {

}

export function SPY() {

}

export function DEBUG() {

}

export function DEBUG_OBJ() {

}

export function POPCORN() {

}

export function FLOW_POINT() {

}

export function FLOW_OBJ() {

}

export function SET_ANIM_DIAL() {

}

export function PCX() {

}

export function END_MESSAGE() {

}

export function END_MESSAGE_OBJ() {

}

export function PARM_SAMPLE() {

}

export function NEW_SAMPLE() {

}

export function POS_OBJ_AROUND() {

}

export function PCX_MESS_OBJ() {

}

