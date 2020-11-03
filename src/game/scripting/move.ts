import * as THREE from 'three';
import { unimplemented } from './utils';
import { WORLD_SCALE, getRandom, distAngle } from '../../utils/lba';
import { ScriptContext } from './ScriptContext';
import Point from '../Point';

export function GOTO_POINT(this: ScriptContext, point: Point) {
    if (!point) {
        return;
    }
    if (this.actor.index === 0 && this.game.controlsState.firstPerson) {
        this.actor.physics.position.copy(point.physics.position);
        this.actor.stop();
        return;
    }
    const distance = this.actor.goto(point.physics.position);
    if (distance > 0.55) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    } else {
        this.actor.stop();
    }
}

export function WAIT_ANIM(this: ScriptContext) {
    if (this.actor.animState.hasEnded) {
        this.actor.props.angle = 0;
    } else {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    }
}

export function ANGLE(this: ScriptContext, angle) {
    this.actor.setAngle(angle);
    if (distAngle(this.actor.physics.temp.destAngle, this.actor.physics.temp.angle) > Math.PI / 8) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    } else {
        this.actor.stop();
    }
}

export const GOTO_SYM_POINT = unimplemented();

export function WAIT_NUM_ANIM(this: ScriptContext, repeats) {
    if (!this.state.animCount) {
        this.state.animCount = 0;
    }
    if (this.actor.animState.hasEnded) {
        this.state.animCount += 1;
        if (this.state.animCount === repeats) {
            this.state.animCount = 0;
        } else {
            this.state.continue = false;
        }
    } else {
        this.state.continue = false;
    }

    if (!this.state.continue) {
        this.state.reentryOffset = this.state.offset;
    }
}

export function SAMPLE(this: ScriptContext, index) {
    const audio = this.game.getAudioManager();
    audio.playSample(index);
}

export function GOTO_POINT_3D(this: ScriptContext, point: Point) {
    if (!point) {
        return;
    }
    const distance = this.actor.gotoSprite(
        point.physics.position,
        this.time.delta * WORLD_SCALE * this.actor.props.speed / 5
    );
    if (distance > 0.55) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    } else {
        this.actor.stop();
    }
}

export function SPEED(this: ScriptContext, speed) {
    this.actor.props.speed = speed;
}

export const BACKGROUND = unimplemented();

export function WAIT_NUM_SECOND(this: ScriptContext, numSeconds, _unknown) {
    if (!this.state.waitUntil) {
        this.state.waitUntil = this.time.elapsed + numSeconds;
    }
    if (this.time.elapsed < this.state.waitUntil) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    } else {
        delete this.state.waitUntil;
    }
}

export function WAIT_NUM_DSEC(this: ScriptContext, numDsec, _unknown) {
    WAIT_NUM_SECOND.call(this, numDsec * 0.1, null);
}

export function WAIT_NUM_SECOND_RND(this: ScriptContext, maxNumSeconds, _unknown) {
    const numSeconds = Math.floor(Math.random() * maxNumSeconds);
    WAIT_NUM_SECOND.call(this, numSeconds, null);
}

export function WAIT_NUM_DECIMAL_RND(this: ScriptContext, maxNumDsec, _unknown) {
    const numDsec = Math.floor(Math.random() * maxNumDsec);
    WAIT_NUM_SECOND.call(this, numDsec * 0.1, null);
}

export function OPEN_LEFT(this: ScriptContext, dist) {
    openDoor.call(this, [0, 0, -dist * WORLD_SCALE]);
}

export function OPEN_RIGHT(this: ScriptContext, dist) {
    openDoor.call(this, [0, 0, dist * WORLD_SCALE]);
}

export function OPEN_UP(this: ScriptContext, dist) {
    openDoor.call(this, [dist * WORLD_SCALE, 0, 0]);
}

export function OPEN_DOWN(this: ScriptContext, dist) {
    openDoor.call(this, [-dist * WORLD_SCALE, 0, 0]);
}

const TGT = new THREE.Vector3();

function openDoor(this: ScriptContext, tgt) {
    const {pos} = this.actor.props;
    TGT.set(pos[0] + tgt[0], pos[1] + tgt[1], pos[2] + tgt[2]);
    const distance = this.actor.gotoSprite(TGT, this.time.delta * 2);

    if (distance > 0.001) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    } else {
        this.actor.stop();
    }
}

export function CLOSE(this: ScriptContext) {
    const {pos} = this.actor.props;
    TGT.set(pos[0], pos[1], pos[2]);
    const distance = this.actor.gotoSprite(TGT, this.time.delta * 2);

    if (distance > 0.001) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    } else {
        this.actor.stop();
    }
}

export const WAIT_DOOR = unimplemented();

export function SAMPLE_RND(this: ScriptContext, index) {
    const frequency = getRandom(0x800, 0x1000);
    const audio = this.game.getAudioManager();
    audio.playSample(index, frequency);
}

export function SAMPLE_ALWAYS(this: ScriptContext, index) {
    const audio = this.game.getAudioManager();
    audio.stopSample(index);
    audio.playSample(index, 0x1000, -1);
}

export function SAMPLE_STOP(this: ScriptContext, index) {
    const audio = this.game.getAudioManager();
    audio.stopSample(index);
}

export const PLAY_VIDEO = unimplemented();

export function REPEAT_SAMPLE(this: ScriptContext, loopCount) {
    this.state.sampleLoopCount = loopCount;
}

export function SIMPLE_SAMPLE(this: ScriptContext, index) {
    if (index === 381 || index === 385) {
        return; // Skip thunder sounds
    }
    const audio = this.game.getAudioManager();
    audio.playSample(index, 0x1000, this.state.sampleLoopCount);
    this.state.sampleLoopCount = 0;
}

export function FACE_HERO(this: ScriptContext) {
    const hero = this.scene.actors[0];
    this.actor.facePoint(hero.physics.position);
    if (distAngle(this.actor.physics.temp.destAngle, this.actor.physics.temp.angle) > Math.PI / 8) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    } else {
        this.actor.stop();
    }
}

export const DO = unimplemented();

export const AFF_TIMER = unimplemented();

export const ANGLE_RND = unimplemented();

export const REPLACE = unimplemented();

export const SPRITE = unimplemented();

export const SET_FRAME = unimplemented();

export const SET_FRAME_3DS = unimplemented();

export const SET_START_3DS = unimplemented();

export const SET_END_3DS = unimplemented();

export const START_ANIM_3DS = unimplemented();

export const STOP_ANIM_3DS = unimplemented();

export const WAIT_ANIM_3DS = unimplemented();

export const WAIT_FRAME_3DS = unimplemented();

export const INTERVAL = unimplemented();

export const FREQUENCY = unimplemented();

export const VOLUME = unimplemented();

export const LOOP = unimplemented();
