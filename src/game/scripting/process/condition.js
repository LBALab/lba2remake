export function COL(game, state, param) {
    return 0;
}

export function COL_OBJ(game, state, param) {
    return 0;
}

export function DISTANCE(game, state, param) {

    return 0;
}

export function ZONE(game, state, param) {
    return 0;
}

export function ZONE_OBJ(game, state, param) {
    return 0;
}

export function BODY(game, state, param) {
    return 0;
}

export function BODY_OBJ(game, state, param) {
    return 0;
}

export function ANIM(game, state, param) {
    return 0;
}

export function ANIM_OBJ(game, state, param) {
    return 0;
}

export function CURRENT_TRACK(game, state, param) {
    return state.move.trackIndex;
}

export function CURRENT_TRACK_OBJ(game, state, actorIndex) {
    const actorOther = game.getSceneManager().getScene(state.move.sceneIndex).getActor(actorIndex);
    if (actorOther) {
        return actorOther.scriptState.move.trackIndex;
    }
    return -1;
}

export function VAR_CUBE(game, state, param) {
    return 0;
}

export function CONE_VIEW(game, state, param) {
    return 10000;
}

export function HIT_BY(game, state, param) {
    return -1;
}

export function ACTION(game, state, param) {
    return -1;
}

export function VAR_GAME(game, state, param) {
    return 0;
}

export function LIFE_POINT(game, state, param) {
    return 0;
}

export function LIFE_POINT_OBJ(game, state, param) {
    return 0;
}

export function NUM_LITTLE_KEYS(game, state, param) {
    return 0;
}

export function NUM_GOLD_PIECES(game, state, param) {
    return 0;
}

export function BEHAVIOUR(game, state, param) {
    return 0;
}

export function CHAPTER(game, state, param) {
    return game.getState().game.chapter;
}

export function DISTANCE_3D(game, state, param) {
    return 0;
}

export function MAGIC_LEVEL(game, state, param) {
    return 0;
}

export function MAGIC_POINT(game, state, param) {
    return 0;
}

export function USE_INVENTORY(game, state, param) {
    return 0;
}

export function CHOICE(game, state, param) {
    return 0;
}

export function FUEL(game, state, param) {
    return 0;
}

export function CARRIED_BY(game, state, param) {
    return 0;
}

export function CDROM(game, state, param) {
    return 0;
}

export function LADDER(game, state, param) {
    return 0;
}

export function RND(game, state, param) {
    return 0;
}

export function RAIL(game, state, param) {
    return 0;
}

export function BETA(game, state, param) {
    return 0;
}

export function BETA_OBJ(game, state, param) {
    return 0;
}

export function CARRIED_OBJ_BY(game, state, param) {
    return 0;
}

export function ANGLE(game, state, param) {
    return 0;
}

export function DISTANCE_MESSAGE(game, state, param) {
    return 0;
}

export function HIT_OBJ_BY(game, state, param) {
    return 0;
}

export function REAL_ANGLE(game, state, param) {
    return 0;
}

export function DEMO(game, state, param) {
    return 0;
}

export function COL_DECORS(game, state, param) {
    return 0;
}

export function COL_DECORS_OBJ(game, state, param) {
    return 0;
}

export function PROCESSOR(game, state, param) {
    return 0;
}

export function OBJECT_DISPLAYED(game, state, param) {
    return 0;
}

export function ANGLE_OBJ(game, state, param) {
    return 0;
}
