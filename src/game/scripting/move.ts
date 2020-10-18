import * as THREE from 'three';
import { unimplemented } from './utils';
import { WORLD_SCALE, getRandom, distAngle } from '../../utils/lba';

export function GOTO_POINT(point) {
    if (!point) {
        return;
    }
    if (this.actor.index === 0 && this.game.controlsState.firstPerson) {
        this.actor.physics.position.copy(point.physics.position);
        this.actor.stop();
        return;
    }
    const distance = this.actor.goto(point.physics.position);
    if (distance > 0.65) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    } else {
        this.actor.stop();
    }
}

export function WAIT_ANIM() {
    if (this.actor.animState.hasEnded) {
        this.actor.props.angle = 0;
    } else {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    }
}

export function ANGLE(angle) {
    this.actor.setAngle(angle);
    if (distAngle(this.actor.physics.temp.destAngle, this.actor.physics.temp.angle) > Math.PI / 8) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    } else {
        this.actor.stop();
    }
}

export const GOTO_SYM_POINT = unimplemented();

export function WAIT_NUM_ANIM(repeats) {
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

export function SAMPLE(index) {
    const audio = this.game.getAudioManager();
    audio.playSample(index);
}

export const GOTO_POINT_3D = unimplemented();

export function SPEED(speed) {
    this.actor.props.speed = speed;
}

export const BACKGROUND = unimplemented();

export function WAIT_NUM_SECOND(numSeconds, _unknown, time) {
    if (!this.state.waitUntil) {
        this.state.waitUntil = time.elapsed + numSeconds;
    }
    if (time.elapsed < this.state.waitUntil) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    } else {
        delete this.state.waitUntil;
    }
}

export function WAIT_NUM_DSEC(numDsec, _unknown, time) {
    WAIT_NUM_SECOND.call(this, numDsec * 0.1, null, time);
}

export function WAIT_NUM_SECOND_RND(maxNumSeconds, _unknown, time) {
    const numSeconds = Math.floor(Math.random() * maxNumSeconds);
    WAIT_NUM_SECOND.call(this, numSeconds, null, time);
}

export function WAIT_NUM_DECIMAL_RND(maxNumDsec, _unknown, time) {
    const numDsec = Math.floor(Math.random() * maxNumDsec);
    WAIT_NUM_SECOND.call(this, numDsec * 0.1, null, time);
}

export function OPEN_LEFT(dist, time) {
    openDoor.call(this, [0, 0, -dist * WORLD_SCALE], time);
}

export function OPEN_RIGHT(dist, time) {
    openDoor.call(this, [0, 0, dist * WORLD_SCALE], time);
}

export function OPEN_UP(dist, time) {
    openDoor.call(this, [dist * WORLD_SCALE, 0, 0], time);
}

export function OPEN_DOWN(dist, time) {
    openDoor.call(this, [-dist * WORLD_SCALE, 0, 0], time);
}

const TGT = new THREE.Vector3();

function openDoor(tgt, time) {
    const {pos} = this.actor.props;
    TGT.set(pos[0] + tgt[0], pos[1] + tgt[1], pos[2] + tgt[2]);
    const distance = this.actor.gotoSprite(TGT, time.delta * 2);

    if (distance > 0.001) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    } else {
        this.actor.stop();
    }
}

export function CLOSE(time) {
    const {pos} = this.actor.props;
    TGT.set(pos[0], pos[1], pos[2]);
    const distance = this.actor.gotoSprite(TGT, time.delta * 2);

    if (distance > 0.001) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    } else {
        this.actor.stop();
    }
}

export const WAIT_DOOR = unimplemented();

export function SAMPLE_RND(index) {
    const frequency = getRandom(0x800, 0x1000);
    const audio = this.game.getAudioManager();
    audio.playSample(index, frequency);
}

export function SAMPLE_ALWAYS(index) {
    const audio = this.game.getAudioManager();
    audio.stopSample(index);
    audio.playSample(index, 0x1000, -1);
}

export function SAMPLE_STOP(index) {
    const audio = this.game.getAudioManager();
    audio.stopSample(index);
}

export const PLAY_ACF = unimplemented();

export function REPEAT_SAMPLE(loopCount) {
    this.state.sampleLoopCount = loopCount;
}

export function SIMPLE_SAMPLE(index) {
    if (index === 381 || index === 385) {
        return; // Skip thunder sounds
    }
    const audio = this.game.getAudioManager();
    audio.playSample(index, 0x1000, this.state.sampleLoopCount);
    this.state.sampleLoopCount = 0;
}

export function FACE_HERO() {
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
