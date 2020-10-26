import { BODY_OBJ, ANIM_OBJ } from './life';
import { ScriptContext } from './ScriptContext';
import Point from '../Point';

export function BODY(this: ScriptContext, bodyIndex) {
    BODY_OBJ.call(this, this.actor, bodyIndex);
}

export function ANIM(this: ScriptContext, animIndex) {
    ANIM_OBJ.call(this, this.actor, animIndex);
}

export function BETA(this: ScriptContext, angle) {
    this.actor.setAngle(angle);
}

export function NO_BODY(this: ScriptContext) {
    this.actor.props.bodyIndex = -1;
    this.actor.state.isVisible = false;
    if (this.actor.threeObject) {
        this.actor.threeObject.visible = false;
    }
}

export function POS_POINT(this: ScriptContext, point: Point) {
    this.actor.physics.position.copy(point.physics.position);
    if (this.actor.model) {
        this.actor.model.mesh.position.copy(point.physics.position);
    }
}
