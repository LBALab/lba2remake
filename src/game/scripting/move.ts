import * as THREE from 'three';
import { unimplemented } from './utils';
import { WORLD_SCALE, getRandom, distAngle } from '../../utils/lba';
import { ScriptContext } from './ScriptContext';
import Point from '../Point';

const EULER = new THREE.Euler();
const EULER2 = new THREE.Euler();
const Q = new THREE.Quaternion();
const BASE_ANGLE = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

function adjustFPAngle(ctx: ScriptContext, force = false) {
    if (!force
        && ctx.state.lastVRAngleAdjust
        && Date.now() - ctx.state.lastVRAngleAdjust < 2000) {
        // Only adjust every 2 seconds
        return;
    }
    const { controlNode, threeCamera } = ctx.scene.camera;
    EULER.setFromQuaternion(controlNode.quaternion, 'YXZ');
    const oldAngle = EULER.y;
    EULER.y = 0;
    for (let i = 0; i < 16; i += 1) {
        controlNode.quaternion.setFromEuler(EULER);
        controlNode.updateMatrix();
        controlNode.updateMatrixWorld();
        threeCamera.updateMatrix();
        threeCamera.updateMatrixWorld();
        Q.setFromRotationMatrix(threeCamera.matrixWorld);
        Q.multiply(BASE_ANGLE);
        EULER2.setFromQuaternion(Q, 'YXZ');
        EULER2.x = 0;
        EULER2.z = 0;
        Q.setFromEuler(EULER2);
        const angle = ctx.actor.physics.orientation.angleTo(Q);
        if (Math.abs(angle) <= Math.PI / 16) {
            break;
        }
        EULER.y += Math.PI / 8;
    }
    if (Math.abs(EULER.y - oldAngle) < 0.0001) {
        ctx.state.lastVRAngleAdjust = Date.now();
    }
}

export function GOTO_POINT(this: ScriptContext, point: Point) {
    if (!point) {
        return;
    }
    if (this.game.getState().actorTalking > -1) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
        return;
    }
    if (this.actor.index === 0 && this.game.controlsState.firstPerson) {
        adjustFPAngle(this);
    }
    const distance = this.actor.goto(point.physics.position);
    if (distance > 0.55) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
        this.state.goingToPoint = true;
    } else {
        this.actor.stop();
        this.state.goingToPoint = false;
        delete this.state.lastVRAngleAdjust;
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
        if (this.actor.index === 0 && this.game.controlsState.firstPerson) {
            adjustFPAngle(this, true);
        }
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
    this.actor.playSample(index);
}

export function GOTO_POINT_3D(this: ScriptContext, point: Point) {
    if (!point) {
        return;
    }
    if (this.game.getState().actorTalking > -1) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
        return;
    }
    const distance = this.actor.gotoPosition(
        point.physics.position,
        this.time.delta * WORLD_SCALE * this.actor.props.speed
    );
    if (distance > 0.01) {
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
    this.actor.physics.temp.doorPosition = [0, 0, -dist * WORLD_SCALE];
    WAIT_DOOR.call(this);
}

export function OPEN_RIGHT(this: ScriptContext, dist) {
    this.actor.physics.temp.doorPosition = [0, 0, dist * WORLD_SCALE];
    WAIT_DOOR.call(this);
}

export function OPEN_UP(this: ScriptContext, dist) {
    this.actor.physics.temp.doorPosition = [dist * WORLD_SCALE, 0, 0];
    WAIT_DOOR.call(this);
}

export function OPEN_DOWN(this: ScriptContext, dist) {
    this.actor.physics.temp.doorPosition = [-dist * WORLD_SCALE, 0, 0];
    WAIT_DOOR.call(this);
}

export function CLOSE(this: ScriptContext) {
    this.actor.physics.temp.doorPosition = [0, 0, 0];
    WAIT_DOOR.call(this);
}

const TGT = new THREE.Vector3();

export function WAIT_DOOR(this: ScriptContext) {
    if (this.actor.physics.temp.doorPosition) {
        const tgt = this.actor.physics.temp.doorPosition;
        const { pos } = this.actor.props;
        TGT.set(pos[0] + tgt[0], pos[1] + tgt[1], pos[2] + tgt[2]);
        const distance = this.actor.gotoSprite(
            TGT,
            this.time.delta * 2
        );
        if (distance > 0.001) {
            this.state.reentryOffset = this.state.offset;
            this.state.continue = false;
        } else {
            this.actor.stop();
        }
    }
}

export function SAMPLE_RND(this: ScriptContext, index) {
    const frequency = getRandom(0x800, 0x1000);
    this.actor.playSample(index, frequency);
}

export function SAMPLE_ALWAYS(this: ScriptContext, index) {
    this.actor.stopSample(index);
    this.actor.playSample(index, 0x1000, -1);
}

export function SAMPLE_STOP(this: ScriptContext, index) {
    this.actor.stopSample(index);
}

export const PLAY_VIDEO = unimplemented();

export function REPEAT_SAMPLE(this: ScriptContext, loopCount) {
    this.state.sampleLoopCount = loopCount;
}

export function SIMPLE_SAMPLE(this: ScriptContext, index) {
    if (index === 381 || index === 385) {
        return; // Skip thunder sounds
    }
    this.actor.playSample(index, 0x1000, this.state.sampleLoopCount);
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

export function SPRITE(this: ScriptContext, index) {
    this.actor.setSprite(this.scene, index);
}

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
