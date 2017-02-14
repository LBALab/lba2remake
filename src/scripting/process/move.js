import {getDistance} from '../../utils/lba';

export function BODY(bodyIndex) {
    this.actor.props.bodyIndex = bodyIndex;
}

export function ANIM(animIndex) {
    this.actor.props.animIndex = animIndex;
    this.actor.resetAnimState();
}

export function GOTO_POINT(pointIndex) {
    const point = this.scene.getPoint(pointIndex);
    const distance = this.actor.goto(point.physics.position);

    if (distance > getDistance(500)) {
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
}

export function POS_POINT(pointIndex) {
    const point = this.scene.getPoint(pointIndex);
    this.actor.physics.position.copy(point.physics.position);
    if (this.actor.model)
        this.actor.model.mesh.position.copy(point.physics.position);
}

export function GOTO_SYM_POINT() {
    
}

export function WAIT_NUM_ANIM(repeats) {
    if (!this.state.animCount) {
        this.state.animCount = 0;
    }
    if (this.actor.animState.hasEnded) {
        this.state.animCount++;
        if (this.state.animCount == repeats) {
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

export function SAMPLE() {
    
}

export function GOTO_POINT_3D() {
    
}

export function SPEED() {
    
}

export function BACKGROUND() {
    
}

export function WAIT_NUM_SECOND(numSeconds, time) {
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

export function WAIT_NUM_DSEC(numDsec, time) {
    WAIT_NUM_SECOND.call(this, numDsec * 0.1, time);
}

export function WAIT_NUM_SECOND_RND(numSeconds, unknown, time) {
    // TODO random seconds
    WAIT_NUM_SECOND.call(this, numSeconds, time);
}

export function WAIT_NUM_DECIMAL_RND(numDsec, unknown, time) {
    // TODO random seconds
    WAIT_NUM_SECOND.call(this, numDsec * 0.1, time);
}

export function NO_BODY() {
    this.actor.visible = false;
}

export function BETA() {
    
}

export function OPEN_LEFT() {
    
}

export function OPEN_RIGHT() {
    
}

export function OPEN_UP() {
    
}

export function OPEN_DOWN() {
    
}

export function CLOSE() {
    
}

export function WAIT_DOOR() {
    
}

export function SAMPLE_RND() {
    
}

export function SAMPLE_ALWAYS() {
    
}

export function SAMPLE_STOP() {
    
}

export function PLAY_ACF() {
    
}

export function REPEAT_SAMPLE() {
    
}

export function SIMPLE_SAMPLE() {
    
}

export function FACE_HERO() {
    
}

export function ANGLE_RND() {
    
}

export function REPLACE() {
    
}

export function SPRITE() {
    
}

export function SET_FRAME() {
    
}

export function SET_FRAME_3DS() {
    
}

export function SET_START_3DS() {
    
}

export function SET_END_3DS() {
    
}

export function START_ANIM_3DS() {
    
}

export function STOP_ANIM_3DS() {
    
}

export function WAIT_ANIM_3DS() {
    
}

export function WAIT_FRAME_3DS() {
    
}

export function INTERVAL() {
    
}

export function FREQUENCY() {
    
}

export function VOLUME() {
    
}
