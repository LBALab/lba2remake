import { BODY_OBJ, ANIM_OBJ } from './life';

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
    this.actor.props.bodyIndex = -1;
    this.actor.props.flags.isVisible = false;
    if (this.actor.threeObject) {
        this.actor.threeObject.visible = false;
    }
}

export function POS_POINT(point) {
    this.actor.physics.position.copy(point.physics.position);
    if (this.actor.model) {
        this.actor.model.mesh.position.copy(point.physics.position);
    }
}
