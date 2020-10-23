import * as THREE from 'three';
import { WORLD_SIZE } from '../../utils/lba';
import { ScriptContext } from './ScriptContext';
import Actor from '../Actor';

export function COL(this: ScriptContext) {
    if (this.actor.props.life <= 0) {
        return -1;
    }
    return this.actor.state.hasCollidedWithActor;
}

export function COL_OBJ(this: ScriptContext, actor: Actor) {
    if (actor.props.life <= 0) {
        return -1;
    }
    return actor.state.hasCollidedWithActor;
}

export function DISTANCE(this: ScriptContext, actor: Actor) {
    if (!this.scene.isActive && (actor.index === 0 || this.actor.index === 0)) {
        return Infinity;
    }
    if (actor.state.isDead) {
        return Infinity;
    }
    return this.actor.getDistanceLba(actor.physics.position);
}

export function ZONE(this: ScriptContext) {
    return ZONE_OBJ.call(this, this.actor);
}

export function ZONE_OBJ(this: ScriptContext, actor) {
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

export function BODY(this: ScriptContext) {
    return this.actor.props.bodyIndex;
}

export function BODY_OBJ(this: ScriptContext, actor: Actor) {
    return actor.props.bodyIndex;
}

export function ANIM(this: ScriptContext) {
    return this.actor.props.animIndex;
}

export function ANIM_OBJ(this: ScriptContext, actor: Actor) {
    return actor.props.animIndex;
}

export function CURRENT_TRACK(this: ScriptContext) {
    return this.moveState.trackIndex;
}

export function CURRENT_TRACK_OBJ(this: ScriptContext, actor: Actor) {
    return actor.scripts.move.context.state.trackIndex;
}

export function VAR_CUBE(this: ScriptContext, index) {
    return this.scene.variables[index];
}

export function CONE_VIEW(this: ScriptContext, actor: Actor) {
    if (actor.state.isDead) {
        return Infinity;
    }
    return 10000;
}

CONE_VIEW.unimplemented = true;

export function HIT_BY(this: ScriptContext) {
    return this.actor.state.wasHitBy;
}

export function ACTION(this: ScriptContext) {
    return this.game.controlsState.action;
}

export function VAR_GAME(this: ScriptContext, index) {
    return this.game.getState().flags.quest[index];
}

export function LIFE_POINT(this: ScriptContext) {
    return LIFE_POINT_OBJ.call(this, this.actor);
}

export function LIFE_POINT_OBJ(this: ScriptContext, actor: Actor) {
    return actor.props.life;
}

export function KEYS(this: ScriptContext) {
    return this.game.getState().hero.keys;
}

export function MONEY(this: ScriptContext) {
    return this.game.getState().hero.money;
}

export function HERO_BEHAVIOUR(this: ScriptContext) {
    return this.game.getState().hero.behaviour;
}

export function CHAPTER(this: ScriptContext) {
    return this.game.getState().chapter;
}

export function DISTANCE_3D(this: ScriptContext, actor: Actor) {
    return DISTANCE.call(this, actor);
}

export function MAGIC_LEVEL(this: ScriptContext) {
    return this.game.getState().hero.magic;
}

export function MAGIC_POINTS(this: ScriptContext) {
    return this.game.getState().hero.magicball.level;
}

export function USING_INVENTORY(this: ScriptContext, itemId) {
    if (this.game.getState().hero.usingItemId === itemId) {
        return 1;
    }
    return 0;
}

export function CHOICE(this: ScriptContext) {
    return this.state.choice;
}

export function FUEL(this: ScriptContext) {
    return this.game.getState().hero.fuel;
}

export function CARRIED_BY(this: ScriptContext) {
    return -1;
}

CARRIED_BY.unimplemented = true;

export function CDROM(this: ScriptContext) {
    return 1;
}

export function LADDER(this: ScriptContext) {
    return -1;
}

LADDER.unimplemented = true;

export function RND(this: ScriptContext, max) {
    return Math.floor(Math.random() * max);
}

export function RAIL(this: ScriptContext) {
    return -1;
}

RAIL.unimplemented = true;

export function BETA(this: ScriptContext) {
    return BETA_OBJ.call(this, this.actor);
}

export function BETA_OBJ(this: ScriptContext, actor: Actor) {
    const angle = actor.physics.temp.angle + (Math.PI / 2);
    return ((THREE.MathUtils.radToDeg(angle) / 360) * 0x1000) % 0x1000;
}

export function CARRIED_OBJ_BY(this: ScriptContext) {
    return -1;
}

CARRIED_OBJ_BY.unimplemented = true;

export function ANGLE(this: ScriptContext, actor: Actor) {
    if (actor.state.isDead) {
        return Infinity;
    }
    return -1;
}

ANGLE.unimplemented = true;

export function DISTANCE_MESSAGE(this: ScriptContext, actor: Actor) {
    return DISTANCE.call(this, actor);
}

export function HIT_OBJ_BY(this: ScriptContext, actor: Actor) {
    return actor.state.wasHitBy;
}

export function REAL_ANGLE(this: ScriptContext, actor: Actor) {
    if (actor.state.isDead) {
        return Infinity;
    }
    return -1;
}

REAL_ANGLE.unimplemented = true;

export function DEMO(this: ScriptContext) {
    return -1;
}

DEMO.unimplemented = true;

export function COL_DECORS(this: ScriptContext) {
    return -1;
}

COL_DECORS.unimplemented = true;

export function COL_DECORS_OBJ(this: ScriptContext) {
    return -1;
}

COL_DECORS_OBJ.unimplemented = true;

export function PROCESSOR(this: ScriptContext) {
    return 1; // default cpu 486
}

export function OBJECT_DISPLAYED(this: ScriptContext) {
    return -1;
}

OBJECT_DISPLAYED.unimplemented = true;

export function ANGLE_OBJ(this: ScriptContext, actor: Actor) {
    if (actor.state.isDead) {
        return Infinity;
    }
    return -1;
}

ANGLE_OBJ.unimplemented = true;
