import {getDistance} from '../../utils/lba';

export function GOTO_POINT(pointIndex) {
    const point = this.scene.points[pointIndex];
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

export function GOTO_SYM_POINT() {

}

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
    const soundFxSource = this.game.getAudioManager().getSoundFxSource();
    soundFxSource.load(index, () => {
        soundFxSource.play();
    });
}

export function GOTO_POINT_3D() {

}

export function SPEED(speed) {
    this.actor.props.speed = speed;
}

export function BACKGROUND() {

}

export function WAIT_NUM_SECOND(numSeconds, unknown, time) {
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

export function WAIT_NUM_DSEC(numDsec, unknown, time) {
    WAIT_NUM_SECOND.call(this, numDsec * 0.1, null, time);
}

export function WAIT_NUM_SECOND_RND(maxNumSeconds, unknown, time) {
    const numSeconds = Math.floor(Math.random() * maxNumSeconds);
    WAIT_NUM_SECOND.call(this, numSeconds, null, time);
}

export function WAIT_NUM_DECIMAL_RND(maxNumDsec, unknown, time) {
    const numDsec = Math.floor(Math.random() * maxNumDsec);
    WAIT_NUM_SECOND.call(this, numDsec * 0.1, null, time);
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

export function SAMPLE_RND(index) {
    const soundFxSource = this.game.getAudioManager().getSoundFxSource();
    soundFxSource.load(index, () => {
        soundFxSource.play();
    });
}

export function SAMPLE_ALWAYS(index) {
    const soundFxSource = this.game.getAudioManager().getSoundFxSource();
    soundFxSource.load(index, () => {
        soundFxSource.play();
    });
}

export function SAMPLE_STOP() {

}

export function PLAY_ACF() {

}

export function REPEAT_SAMPLE() {

}

export function SIMPLE_SAMPLE(index) {
    const soundFxSource = this.game.getAudioManager().getSoundFxSource();
    soundFxSource.load(index, () => {
        soundFxSource.play();
    });
}

export function FACE_HERO() {
    const hero = this.scene.actors[0];
    this.actor.facePoint(hero.physics.position);

    const distAngle = Math.abs(this.actor.physics.temp.destAngle - this.actor.physics.temp.angle);

    if (distAngle > Math.PI / 8) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    } else {
        this.actor.stop();
    }
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
