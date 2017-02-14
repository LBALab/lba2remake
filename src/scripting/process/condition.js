import {convertDistance} from '../../utils/lba';

export function COL() {
    return 0;
}

export function COL_OBJ() {
    return 0;
}

export function DISTANCE() {
    return 0;
}

export function ZONE() {
    return 0;
}

export function ZONE_OBJ() {
    return 0;
}

export function BODY() {
    return 0;
}

export function BODY_OBJ() {
    return 0;
}

export function ANIM() {
    return 0;
}

export function ANIM_OBJ() {
    return 0;
}

export function CURRENT_TRACK() {
    return this.moveState.trackIndex;
}

export function CURRENT_TRACK_OBJ(actor) {
    return actor.scripts.move.context.state.trackIndex;
}

export function VAR_CUBE(index) {
    return this.game.getState().flags.scene[index];
}

export function CONE_VIEW() {
    return 10000;
}

export function HIT_BY() {
    return -1;
}

export function ACTION() {
    return -1;
}

export function VAR_GAME(index) {
    return this.game.getState().flags.quest[index];
}

export function LIFE_POINT() {
    return this.game.getState().hero.life;
}

export function LIFE_POINT_OBJ() {
    return 0;
}

export function NUM_LITTLE_KEYS() {
    return this.game.getState().hero.keys;
}

export function NUM_GOLD_PIECES() {
    return this.game.getState().hero.money;
}

export function BEHAVIOUR() {
    return 0;
}

export function CHAPTER() {
    return this.game.getState().chapter;
}

export function DISTANCE_3D() {
    return 0;
}

export function MAGIC_LEVEL() {
    return this.game.getState().hero.magic;
}

export function MAGIC_POINT() {
    return this.game.getState().hero.magicball.level;
}

export function USE_INVENTORY() {
    return 0;
}

export function CHOICE() {
    return 0;
}

export function FUEL() {
    return this.game.getState().hero.fuel;
}

export function CARRIED_BY() {
    return 0;
}

export function CDROM() {
    return 0;
}

export function LADDER() {
    return 0;
}

export function RND(max) {
    return Math.floor(Math.random() * max);
}

export function RAIL() {
    return 0;
}

export function BETA() {
    return 0;
}

export function BETA_OBJ() {
    return 0;
}

export function CARRIED_OBJ_BY() {
    return 0;
}

export function ANGLE() {
    return 0;
}

export function DISTANCE_MESSAGE() {
    return 0;
}

export function HIT_OBJ_BY() {
    return 0;
}

export function REAL_ANGLE() {
    return 0;
}

export function DEMO() {
    return 0;
}

export function COL_DECORS() {
    return 0;
}

export function COL_DECORS_OBJ() {
    return 0;
}

export function PROCESSOR() {
    return 0;
}

export function OBJECT_DISPLAYED() {
    return 0;
}

export function ANGLE_OBJ() {
    return 0;
}
