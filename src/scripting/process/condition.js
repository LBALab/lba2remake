import THREE from 'three';

export function COL() {
    if (this.actor.life <= 0) {
        return -1;
    }
    return this.actor.hasCollidedWithActor;
}

export function COL_OBJ(actor) {
    if (actor.life <= 0) {
        return -1;
    }
    return actor.hasCollidedWithActor;
}

export function DISTANCE(actor) {
    if (!this.scene.isActive && (actor.index == 0 || this.actor.index == 0))
        return Infinity;
    return this.actor.getDistanceLba(actor.physics.position);
}

export function ZONE() {
    return ZONE_OBJ.call(this, this.actor);
}

export function ZONE_OBJ(actor) {
    const pos = actor.physics.position.clone();
    pos.y += 0.005;
    pos.x -= 0.005;
    for (let i = 0; i < this.scene.zones.length; ++i) {
        const zone = this.scene.zones[i];
        if (zone.props.type !== 2)
            continue;

        const box = zone.props.box;
        if (pos.x >= Math.min(box.bX, box.tX) && pos.x < Math.max(box.bX, box.tX) &&
            pos.y >= Math.min(box.bY, box.tY) && pos.y <= Math.max(box.bY, box.tY) &&
            pos.z >= Math.min(box.bZ, box.tZ) && pos.z < Math.max(box.bZ, box.tZ)) {
            return zone.props.snap;
        }
    }
    return -1;
}

export function BODY() {
    return this.actor.props.bodyIndex;
}

export function BODY_OBJ(actor) {
    return actor.props.bodyIndex;
}

export function ANIM() {
    return this.actor.props.animIndex;
}

export function ANIM_OBJ(actor) {
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
    return this.game.controlsState.action;
}

export function VAR_GAME(index) {
    return this.game.getState().flags.quest[index];
}

export function LIFE_POINT() {
    return this.game.getState().hero.life;
}

export function LIFE_POINT_OBJ(actor) {
    return actor.props.life;
}

export function NUM_LITTLE_KEYS() {
    return this.game.getState().hero.keys;
}

export function NUM_GOLD_PIECES() {
    return this.game.getState().hero.money;
}

export function BEHAVIOUR() {
    return this.game.getState().hero.behaviour;
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
    return this.state.choice;
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
    return BETA_OBJ.call(this, this.actor);
}

export function BETA_OBJ(actor) {
    const angle = actor.physics.temp.angle + Math.PI / 2;
    return (Math.floor(THREE.Math.radToDeg(angle) / 360 * 0x1000) + 0x1000) % 0x1000;
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
