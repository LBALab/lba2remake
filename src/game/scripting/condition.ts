import * as THREE from 'three';
import { WORLD_SIZE } from '../../utils/lba';

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
    if (!this.scene.isActive && (actor.index === 0 || this.actor.index === 0))
        return Infinity;
    if (actor.props.runtimeFlags.isDead) {
        return Infinity;
    }
    return this.actor.getDistanceLba(actor.physics.position);
}

export function ZONE() {
    return ZONE_OBJ.call(this, this.actor);
}

export function ZONE_OBJ(actor) {
    const pos = actor.physics.position.clone();
    let halfHeight = 0.005 * WORLD_SIZE;
    if (actor.model && actor.model.boundingBox) {
        const bb = actor.model.boundingBox;
        halfHeight = (bb.max.y - bb.min.y) * 0.5;
    }
    pos.y += halfHeight;
    for (let i = 0; i < this.scene.zones.length; i += 1) {
        const zone = this.scene.zones[i];
        if (zone.props.type !== 2)
            continue;

        const box = zone.props.box;
        if (pos.x >= box.xMin && pos.x <= box.xMax &&
            pos.y >= box.yMin && pos.y <= box.yMax &&
            pos.z >= box.zMin && pos.z <= box.zMax) {
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

export function CONE_VIEW(actor) {
    if (actor.props.runtimeFlags.isDead) {
        return Infinity;
    }
    return 10000;
}

CONE_VIEW.unimplemented = true;

export function HIT_BY() {
    return this.actor.wasHitBy;
}

export function ACTION() {
    return this.game.controlsState.action;
}

export function VAR_GAME(index) {
    return this.game.getState().flags.quest[index];
}

export function LIFE_POINT() {
    return LIFE_POINT_OBJ(this.actor);
}

export function LIFE_POINT_OBJ(actor) {
    return actor.props.life;
}

export function KEYS() {
    return this.game.getState().hero.keys;
}

export function MONEY() {
    return this.game.getState().hero.money;
}

export function HERO_BEHAVIOUR() {
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

export function MAGIC_POINTS() {
    return this.game.getState().hero.magicball.level;
}

export function USING_INVENTORY() {
    return 0;
}

USING_INVENTORY.unimplemented = true;

export function CHOICE() {
    return this.state.choice;
}

export function FUEL() {
    return this.game.getState().hero.fuel;
}

export function CARRIED_BY() {
    return -1;
}

CARRIED_BY.unimplemented = true;

export function CDROM() {
    return 1;
}

export function LADDER() {
    return -1;
}

LADDER.unimplemented = true;

export function RND(max) {
    return Math.floor(Math.random() * max);
}

export function RAIL() {
    return -1;
}

RAIL.unimplemented = true;

export function BETA() {
    return BETA_OBJ.call(this, this.actor);
}

export function BETA_OBJ(actor) {
    const angle = actor.physics.temp.angle + (Math.PI / 2);
    return ((THREE.MathUtils.radToDeg(angle) / 360) * 0x1000) % 0x1000;
}

export function CARRIED_OBJ_BY() {
    return -1;
}

CARRIED_OBJ_BY.unimplemented = true;

export function ANGLE(actor) {
    if (actor.props.runtimeFlags.isDead) {
        return Infinity;
    }
    return -1;
}

ANGLE.unimplemented = true;

export function DISTANCE_MESSAGE(actor) {
    return DISTANCE.call(this, actor);
}

export function HIT_OBJ_BY(actor) {
    return actor.wasHitBy;
}

export function REAL_ANGLE(actor) {
    if (actor.props.runtimeFlags.isDead) {
        return Infinity;
    }
    return -1;
}

REAL_ANGLE.unimplemented = true;

export function DEMO() {
    return -1;
}

DEMO.unimplemented = true;

export function COL_DECORS() {
    return -1;
}

COL_DECORS.unimplemented = true;

export function COL_DECORS_OBJ() {
    return -1;
}

COL_DECORS_OBJ.unimplemented = true;

export function PROCESSOR() {
    return 1; // default cpu 486
}

export function OBJECT_DISPLAYED() {
    return -1;
}

OBJECT_DISPLAYED.unimplemented = true;

export function ANGLE_OBJ(actor) {
    if (actor.props.runtimeFlags.isDead) {
        return Infinity;
    }
    return -1;
}

ANGLE_OBJ.unimplemented = true;
