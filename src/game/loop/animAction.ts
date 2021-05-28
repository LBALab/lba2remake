import * as THREE from 'three';

import { getRandom, distance2D } from '../../utils/lba';
import { unimplemented } from '../scripting/utils';
import Extra, { ExtraFlag } from '../Extra';
import { SpriteType } from '../data/spriteType';
import SampleType from '../data/sampleType';
import Actor from '../Actor';
import { getParams } from '../../params';
import Game from '../Game';
import Scene from '../Scene';
import MagicBall from '../MagicBall';
import { Time } from '../../datatypes';
import { AnimAction } from '../../resources/parsers/entity2';
import { LBA2Items } from '../data/inventory';
import AnimState from '../../model/anim/AnimState';

interface AnimActionContext {
    time: Time;
    game: Game;
    scene: Scene;
    actor: Actor;
    model?: any;
    animState?: AnimState;
    entityAnim?: any;
}

const isLBA1 = getParams().game === 'lba1';

const ANGLE_OFFSET = isLBA1 ? 0 : 0.225;
const DART_MODEL = 61;
const DART_STRENGTH = 8;

export const NOP = unimplemented();

export const BODY = unimplemented();

export const BODP = unimplemented();

export const ANIM = unimplemented();

export const ANIP = unimplemented();

export function processHit(
    actor: Actor,
    hitStrength: number,
    scene: Scene,
) {
    for (const a of scene.actors) {
        if (a.index === actor.index || !a.state.isVisible || a.state.isDead) {
            continue;
        }
        // TODO(scottwilliams): This doesn't take into account the actor angles.
        if (distance2D(a.physics.position, actor.physics.position) < 1) {
            a.hit(actor.index, hitStrength);
            if (a.state.isDead) {
                a.playSample(SampleType.ACTOR_DYING);
            }
        }
    }
}

export const HIT = (action: AnimAction,  { actor, scene }: AnimActionContext) => {
    processHit(actor, action.strength, scene);
};

export const HIT_HERO = (_action: AnimAction, { scene, game }: AnimActionContext) => {
    processHit(scene.actors[0], game.getState().hero.handStrength, scene);
};

export const SAMPLE = (action: AnimAction, { actor }: AnimActionContext) => {
    actor.playSample(action.sampleIndex, action.frequency);
};

export const SAMPLE_RND = (action: AnimAction, { actor }: AnimActionContext) => {
    let frequency = (getRandom(0, action.frequency) + 0x1000) - (action.frequency >> 1);
    if (frequency < 0 || frequency > 24000) {
        frequency = 0;
    }
    actor.playSample(action.sampleIndex, frequency);
};

export const SAMPLE_REPEAT = (action: AnimAction, { actor }: AnimActionContext) => {
    actor.playSample(action.sampleIndex, 0x1000, action.repeat);
};

export const THROW = (action: AnimAction, { actor, game, scene }: AnimActionContext) => {
    const destAngle = ((action.beta * 2 * Math.PI) / 0x1000)
        + actor.physics.temp.angle - (Math.PI / 2);
    const throwAngle = (action.alpha * 2 * Math.PI) / 0x1000;
    const position = actor.physics.position.clone();
    const offset = new THREE.Vector3(
        0,
        action.yHeight,
        0,
    );
    offset.applyEuler(new THREE.Euler(0, destAngle - ANGLE_OFFSET, 0, 'XZY'));
    position.add(offset);
    Extra.throw(
        game,
        scene,
        position,
        destAngle,
        throwAngle,
        action.spriteIndex,
        0,
        game.getTime(),
        action.speed,
        action.weight,
        action.strength,
    );
};

export const THROW_MAGIC = async (_action: AnimAction, ctx: AnimActionContext) => {
    const { actor, game, scene } = ctx;
    await MagicBall.instance.init(game, scene, actor.physics.position);
    MagicBall.instance.throw(actor.physics.temp.angle, actor.props.entityIndex);
};

export const THROW_ALPHA = (action: AnimAction, { actor, game, scene }: AnimActionContext) => {
    const destAngle = ((action.beta * 2 * Math.PI) / 0x1000)
        + actor.physics.temp.angle - (Math.PI / 2);
    const throwAngle = (action.alpha * 2 * Math.PI) / 0x1000;
    const position = actor.physics.position.clone();
    const offset = new THREE.Vector3(
        0,
        action.yHeight,
        0,
    );
    offset.applyEuler(new THREE.Euler(0, destAngle - ANGLE_OFFSET, 0, 'XZY'));
    position.add(offset);
    Extra.throw(
        game,
        scene,
        position,
        destAngle,
        throwAngle,
        action.spriteIndex,
        0,
        game.getTime(),
        action.speed,
        action.weight,
        action.strength,
    );
};

export const SAMPLE_STOP = (_action, { actor }) => {
    actor.stopSample();
};

export const ZV = unimplemented();

export const LEFT_STEP = (_action: AnimAction, { actor, scene }: AnimActionContext) => {
    const floorSound = actor.state.floorSound;
    if (floorSound !== -1) {
        const offset = isLBA1 ? 126 : (scene.props.isIsland ? 30 : 60);
        const sampleIndex = floorSound + offset;
        const frequency = getRandom(0, 0x1000) + 3596;
        actor.playSample(sampleIndex, frequency);
    }
};

export const RIGHT_STEP = (_action: AnimAction, { actor, scene }: AnimActionContext) => {
    const floorSound = actor.state.floorSound2 !== -1
        ? actor.state.floorSound2
        : actor.state.floorSound;
    if (floorSound !== -1) {
        const offset = isLBA1 ? 141 : (scene.props.isIsland ? 45 : 75);
        const sampleIndex = floorSound + offset;
        const frequency = getRandom(0, 0x1000) + 3596;
        actor.playSample(sampleIndex, frequency);
    }
};

export const THROW_3D = (action: AnimAction, { actor, game, scene }: AnimActionContext) => {
    const destAngle = ((action.beta * 2 * Math.PI) / 0x1000)
        + actor.physics.temp.angle - (Math.PI / 2);
    const throwAngle = (action.alpha * 2 * Math.PI) / 0x1000;
    const position = actor.physics.position.clone();
    const offset = new THREE.Vector3(
        action.distanceZ,
        action.distanceY,
        action.distanceX,
    );
    offset.applyEuler(new THREE.Euler(0, destAngle - ANGLE_OFFSET, 0, 'XZY'));
    position.add(offset);
    Extra.throw(
        game,
        scene,
        position,
        destAngle,
        throwAngle,
        action.spriteIndex,
        0,
        game.getTime(),
        action.speed,
        action.weight,
        action.strength,
    );
};

export const THROW_3D_ALPHA = (action: AnimAction, { actor, game, scene }: AnimActionContext) => {
    const destAngle = ((action.beta * 2 * Math.PI) / 0x1000)
        + actor.physics.temp.angle - (Math.PI / 2);
    const throwAngle = (action.alpha * 2 * Math.PI) / 0x1000;
    const position = actor.physics.position.clone();
    const offset = new THREE.Vector3(
        action.distanceZ,
        action.distanceY,
        action.distanceX,
    );
    offset.applyEuler(new THREE.Euler(0, destAngle - ANGLE_OFFSET, 0, 'XZY'));
    position.add(offset);
    Extra.throw(
        game,
        scene,
        position,
        destAngle,
        throwAngle,
        action.spriteIndex,
        0,
        game.getTime(),
        action.speed,
        action.weight,
        action.strength,
    );
};

export const THROW_SEARCH = (action: AnimAction, { actor, game, scene }: AnimActionContext) => {
    const destAngle = scene.actors[action.targetActor].physics.temp.angle;
    const position = actor.physics.position.clone();
    const offset = new THREE.Vector3(
        0,
        action.yHeight,
        0,
    );
    offset.applyEuler(new THREE.Euler(0, destAngle - ANGLE_OFFSET, 0, 'XZY'));
    position.add(offset);
    Extra.throwAiming(
        actor.index,
        game,
        scene,
        position,
        destAngle,
        action.spriteIndex,
        game.getTime(),
        action.targetActor,
        action.speed,
        action.strength,
    );
};

export const THROW_3D_SEARCH = (action: AnimAction, { actor, game, scene }: AnimActionContext) => {
    const destAngle = scene.actors[action.targetActor].physics.temp.angle - (Math.PI / 2);
    const position = actor.physics.position.clone();
    const offset = new THREE.Vector3(
        action.distanceZ,
        action.distanceY,
        action.distanceX,
    );
    offset.applyEuler(new THREE.Euler(0, destAngle - ANGLE_OFFSET, 0, 'XZY'));
    position.add(offset);
    Extra.throwAiming(
        actor.index,
        game,
        scene,
        position,
        destAngle,
        action.spriteIndex,
        game.getTime(),
        action.targetActor,
        action.speed,
        action.strength,
    );
};

export const THROW_3D_MAGIC = unimplemented();

export const SUPER_HIT = (action: AnimAction,  { actor, scene }: AnimActionContext) => {
    processHit(actor, action.strength, scene);
};

export const THROW_OBJ_3D = (action: AnimAction, { actor, game, scene }: AnimActionContext) => {
    const destAngle = ((action.beta * 2 * Math.PI) / 0x1000)
        + actor.physics.temp.angle - (Math.PI / 2);
    const throwAngle = (action.alpha * 2 * Math.PI) / 0x1000;
    const position = actor.physics.position.clone();
    const offset = new THREE.Vector3(
        action.distanceZ,
        action.distanceY,
        action.distanceX,
    );
    offset.applyEuler(new THREE.Euler(0, destAngle - ANGLE_OFFSET, 0, 'XZY'));
    position.add(offset);
    Extra.throwObject(
        actor.index,
        game,
        scene,
        position,
        destAngle,
        throwAngle,
        action.modelIndex,
        game.getTime(),
        action.speed,
        action.weight,
        action.strength,
    );
};

export const PATH = unimplemented();

export const FLOW = unimplemented();

export const FLOW_3D = unimplemented();

export const THROW_DART = async (action: AnimAction, { game, scene, actor }: AnimActionContext) => {
    const destAngle = actor.physics.temp.angle - Math.PI / 2;
    const throwAngle = (action.alpha * 2 * Math.PI) / 0x1000;
    const position = actor.physics.position.clone();
    const offset = new THREE.Vector3(
        0,
        action.distanceY,
        0.45,
    );
    offset.applyEuler(new THREE.Euler(0, destAngle, 0, 'XZY'));
    position.add(offset);

    const dart = await Extra.throwObject(
        actor.index,
        game,
        scene,
        position,
        destAngle,
        throwAngle,
        DART_MODEL,
        game.getTime(),
        action.speed,
        action.weight,
        DART_STRENGTH,
    );
    dart.flags |= ExtraFlag.DART;

    if (!isLBA1 && game.getState().flags.quest[LBA2Items.DARTS] > 0) {
        game.getState().flags.quest[LBA2Items.DARTS] -= 1;
    }
};

export const SHIELD = unimplemented();

export const SAMPLE_MAGIC = (_, { actor, game }) => {
    const hero = game.getState();
    let index = 0;
    if (hero.magicball?.level === 4) {
        index = 1;
    }
    actor.playSample(index);
};

export const THROW_3D_CONQUE = (
    _action: AnimAction,
    { actor, game, scene }: AnimActionContext
) => {
    const destAngle = actor.physics.temp.angle - Math.PI / 2;
    const position = actor.physics.position.clone();
    const offset = new THREE.Vector3(0.75, 0.5, 0);
    offset.applyEuler(new THREE.Euler(0, destAngle, 0, 'XZY'));
    position.add(offset);
    Extra.bonus(
        game,
        scene,
        position,
        destAngle,
        SpriteType.LIFE,
        5,
        game.getTime()
    );
};

export const ZV_ANIMIT = unimplemented();

export const IMPACT = unimplemented();

export const RENVOIE = unimplemented();

export const RENVOYABLE = unimplemented();

export const TRANSPARENT = unimplemented();

export const SCALE = unimplemented();

export const LEFT_JUMP = unimplemented();

export const RIGHT_JUMP = unimplemented();

export const NEW_SAMPLE = (action: AnimAction, { actor }: { actor: Actor }) => {
    actor.playSample(action.sampleIndex, action.frequency);
};

export const IMPACT_3D = unimplemented();

export const THROW_MAGIC_EXTRA = unimplemented();

export const THROW_FOUDRE = unimplemented();

const AnimActionOpcode = [
    { opcode: 0, command: 'NOP', handler: NOP },
    { opcode: 1, command: 'BODY', handler: BODY },
    { opcode: 2, command: 'BODP', handler: BODP },
    { opcode: 3, command: 'ANIM', handler: ANIM },
    { opcode: 4, command: 'ANIP', handler: ANIP },
    { opcode: 5, command: 'HIT', handler: HIT },
    { opcode: 6, command: 'SAMPLE', handler: SAMPLE },
    { opcode: 7, command: 'SAMPLE_RND', handler: SAMPLE_RND },
    { opcode: 8, command: 'THROW', handler: THROW },
    { opcode: 9, command: 'THROW_MAGIC', handler: THROW_MAGIC },
    { opcode: 10, command: 'SAMPLE_REPEAT', handler: SAMPLE_REPEAT },
    { opcode: 11, command: 'THROW_SEARCH', handler: THROW_SEARCH },
    { opcode: 12, command: 'THROW_ALPHA', handler: THROW_ALPHA },
    { opcode: 13, command: 'SAMPLE_STOP', handler: SAMPLE_STOP },
    { opcode: 14, command: 'ZV', handler: ZV },
    { opcode: 15, command: 'LEFT_STEP', handler: LEFT_STEP },
    { opcode: 16, command: 'RIGHT_STEP', handler: RIGHT_STEP },
    { opcode: 17, command: 'HIT_HERO', handler: HIT_HERO },
    { opcode: 18, command: 'THROW_3D', handler: THROW_3D },
    { opcode: 19, command: 'THROW_3D_ALPHA', handler: THROW_3D_ALPHA },
    { opcode: 20, command: 'THROW_3D_SEARCH', handler: THROW_3D_SEARCH },
    { opcode: 21, command: 'THROW_3D_MAGIC', handler: THROW_3D_MAGIC },
    { opcode: 22, command: 'SUPER_HIT', handler: SUPER_HIT },
    { opcode: 23, command: 'THROW_OBJ_3D', handler: THROW_OBJ_3D },
    { opcode: 24, command: 'PATH', handler: PATH },
    { opcode: 25, command: 'FLOW', handler: FLOW },
    { opcode: 26, command: 'FLOW_3D', handler: FLOW_3D },
    { opcode: 27, command: 'THROW_DART', handler: THROW_DART },
    { opcode: 28, command: 'SHIELD', handler: SHIELD },
    { opcode: 29, command: 'SAMPLE_MAGIC', handler: SAMPLE_MAGIC },
    { opcode: 30, command: 'THROW_3D_CONQUE', handler: THROW_3D_CONQUE },
    { opcode: 31, command: 'ZV_ANIMIT', handler: ZV_ANIMIT },
    { opcode: 32, command: 'IMPACT', handler: IMPACT },
    { opcode: 33, command: 'RENVOIE', handler: RENVOIE },
    { opcode: 34, command: 'RENVOYABLE', handler: RENVOYABLE },
    { opcode: 35, command: 'TRANSPARENT', handler: TRANSPARENT },
    { opcode: 36, command: 'SCALE', handler: SCALE },
    { opcode: 37, command: 'LEFT_JUMP', handler: LEFT_JUMP },
    { opcode: 38, command: 'RIGHT_JUMP', handler: RIGHT_JUMP },
    { opcode: 39, command: 'NEW_SAMPLE', handler: NEW_SAMPLE },
    { opcode: 40, command: 'IMPACT_3D', handler: IMPACT_3D },
    { opcode: 41, command: 'THROW_MAGIC_EXTRA', handler: THROW_MAGIC_EXTRA },
    { opcode: 42, command: 'THROW_FOUDRE', handler: THROW_FOUDRE },
];

export const processAnimAction = (ctx: AnimActionContext) => {
    const {entityAnim, animState} = ctx;
    const actions = entityAnim.actions;
    const animFrame = animState.currentFrame;
    for (const action of actions) {
        if (action.animFrame === animFrame && animState.keyframeChanged) {
            const actionType = AnimActionOpcode[action.type];
            if (actionType !== undefined && actionType.handler !== undefined) {
                actionType.handler(action, ctx);
            }
        }
    }
};
