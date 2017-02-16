import {BODY_OBJ, ANIM_OBJ} from './life';

export function BODY(bodyIndex) {
    BODY_OBJ.call(this, this.actor, bodyIndex);
}

export function ANIM(animIndex) {
    ANIM_OBJ.call(this, this.actor, animIndex);
}

export function BETA(angle) {
    this.actor.setAngle(angle);
}

export function NO_BODY() {
    this.actor.visible = false;
}

export function POS_POINT(pointIndex) {
    const point = this.scene.getPoint(pointIndex);
    this.actor.physics.position.copy(point.physics.position);
    if (this.actor.model)
        this.actor.model.mesh.position.copy(point.physics.position);
}
