export function END() {
    this.state.reentryOffset = -1;
    this.state.continue = false;
}

export function NOP() {

}

export function RETURN() {
    this.state.continue = false;
}

export function OFFSET(offset) {
    this.state.offset = offset;
}

export function IF(condition, operator, offset) {
    if (!operator(condition())) {
        this.state.offset = offset;
    }
}

export function SNIF(condition, operator, offset) {
    IF.call(this, condition, operator, offset);
}

export function NEVERIF(condition, operator, offset) {
    IF.call(this, condition, operator, offset);
}

export function SWIF(condition, operator, offset) {
    IF.call(this, condition, operator, offset);
}

export function ONEIF(condition, operator, offset) {
    IF.call(this, condition, operator, offset);
}

export function OR_IF(condition, operator, offset) {
    IF.call(this, condition, operator, offset);
}

export function ELSE(offset) {
    OFFSET.call(this, offset);
}

export function ENDIF() {

}

export function COMPORTEMENT() {
    
}

export function SET_COMPORTEMENT(offset) {
    this.state.reentryOffset = offset;
    this.state.continue = false;
}

export function SET_COMPORTEMENT_OBJ(actor, offset) {
    actor.scripts.life.context.state.offset = offset;
}

export function END_COMPORTEMENT(offset) {
    this.state.reentryOffset = offset;
    this.state.continue = false;
}

export function AND_IF(condition, operator, offset) {
    IF.call(this, condition, operator, offset);
}

export function SWITCH(x, y, z) {
    console.log('SWITCH', x, y, z);
}

export function OR_CASE() {

}

export function CASE() {

}

export function DEFAULT(offset) {

}

export function BREAK(offset) {
    OFFSET.call(this, offset);
}

export function END_SWITCH() {

}
