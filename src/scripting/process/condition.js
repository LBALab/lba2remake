
export function COL() {
    return -1;
}

export function COL_OBJ() {
    return -1;
}

export function DISTANCE(actor) {
    return this.actor.getDistanceLba(actor.physics.position);
}

export function ZONE() {
    return -1;
}

export function ZONE_OBJ(index) {
    return -1;
}

export function BODY() {
    return this.actor.props.bodyIndex;
}

export function BODY_OBJ(index) {
    const actor = this.scene.getActor(index);
    return actor.props.bodyIndex;
}

export function ANIM() {
    return this.actor.props.animIndex;
}

export function ANIM_OBJ(index) {
    const actor = this.scene.getActor(index);
    return actor.props.animIndex;
}

export function CURRENT_TRACK() {
    return this.moveState.trackIndex;
}

export function CURRENT_TRACK_OBJ(actor) {
    return actor.scripts.move.context.state.trackIndex;
}

export function VAR_CUBE(index) {
    return this.scene.variables[index];
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
    return -1;
}

export function NUM_LITTLE_KEYS() {
    return this.game.getState().hero.keys;
}

export function NUM_GOLD_PIECES() {
    return this.game.getState().hero.money;
}

export function BEHAVIOUR() {
    return -1;
}

export function CHAPTER() {
    return this.game.getState().chapter;
}

export function DISTANCE_3D(actor) {
    return DISTANCE.call(this, actor);
}

export function MAGIC_LEVEL() {
    return this.game.getState().hero.magic;
}

export function MAGIC_POINT() {
    return this.game.getState().hero.magicball.level;
}

export function USE_INVENTORY() {
    return -1;
}

export function CHOICE() {
    return -1;
}

export function FUEL() {
    return this.game.getState().hero.fuel;
}

export function CARRIED_BY() {
    return -1;
}

export function CDROM() {
    return -1;
}

export function LADDER() {
    return -1;
}

export function RND(max) {
    return Math.floor(Math.random() * max);
}

export function RAIL() {
    return -1;
}

export function BETA() {
    return -1;
}

export function BETA_OBJ() {
    return -1;
}

export function CARRIED_OBJ_BY() {
    return -1;
}

export function ANGLE() {
    return -1;
}

export function DISTANCE_MESSAGE(actor) {
    return DISTANCE.call(this, actor);
}

export function HIT_OBJ_BY() {
    return -1;
}

export function REAL_ANGLE() {
    return -1;
}

export function DEMO() {
    return -1;
}

export function COL_DECORS() {
    return -1;
}

export function COL_DECORS_OBJ() {
    return -1;
}

export function PROCESSOR() {
    return -1;
}

export function OBJECT_DISPLAYED() {
    return -1;
}

export function ANGLE_OBJ() {
    return -1;
}
