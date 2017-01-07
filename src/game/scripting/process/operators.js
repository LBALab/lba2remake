import {ConditionOpcode} from '../data/condition';
import {OperatorOpcode} from '../data/operator';
import * as DEBUG from '../debug';

function testConditionValue(operator, a, b) {
	switch (operator) {
        case 0:
            return a == b;
        case 1:
            return a > b;
        case 2:
            return a < b;
        case 3:
            return a >= b;
        case 4:
            return a <= b;
        case 5:
            return a != b;
        default:
            console.debug("Unknown operator");
	}
	return false;
}

function getCondition(script, state) {
    const conditionIndex = script.getUint8(state.life.offset++, true);
    const condition = ConditionOpcode[conditionIndex];
    let param = null; 
    DEBUG.addLife(state.life.debug, " " + condition.command);
    if (condition.param) {
        param = script.getUint8(state.life.offset++, true);
    }
    const value1 = condition.callback(param);
    DEBUG.addLife(state.life.debug, " " + value1);
    return {
        condition,
        value1
    };
}

function testConditionOperand(script, state, condition, value1) {
    const operator = script.getUint8(state.life.offset++, true);
    let value2 = null;
    if (condition.value_size == 1) {
        value2 = script.getInt8(state.life.offset++, true);
    } else {
        value2 = script.getInt16(state.life.offset, true);
        state.life.offset += 2;
    }
    DEBUG.addLife(state.life.debug, " " + OperatorOpcode[operator].command + " " + value2);
    return testConditionValue(operator, value1, value2);
}

function testCondition(script, state) {
    const {condition, value1} = getCondition(script, state);
    return testConditionOperand(script, state, condition, value1);
}

function testSwitchCondition(script, state, condition, value1) {
    return testConditionOperand(script, state, condition, value1);
}



export function END(script, state, actor) {
    state.life.continue = false;
    state.life.reentryOffset = -1; // double check this later
}

export function RETURN(script, state, actor) {
    state.life.continue = false;
}

export function SNIF(script, state, actor) {
    if (!testCondition(script, state)) {
        script.setUint8(state.life.opcodeOffset, 0x0D); // override opcode to SWIF
    }
    state.life.offset = script.getUint16(state.life.offset, true);
}

export function OFFSET(script, state, actor) {
    state.life.offset = script.getUint16(state.life.offset, true);
}

export function NEVERIF(script, state, actor) {
    testCondition(script, state);
    state.life.offset = script.getUint16(state.life.offset, true);
}

export function IF(script, state, actor) {
    if (!testCondition(script, state)) {
        state.life.offset = script.getUint16(state.life.offset, true);
        return;
    }
    state.life.offset += 2;
}

export function SWIF(script, state, actor) {
    if (!testCondition(script, state)) {
        state.life.offset = script.getUint16(state.life.offset, true);
        return;
    }
    state.life.offset += 2;
    script.setUint8(state.life.opcodeOffset, 0x02); // override opcode to SNIF
}

export function ONEIF(script, state, actor) {
    if (!testCondition(script, state)) {
        state.life.offset = script.getUint16(state.life.offset, true);
        return;
    }
    state.life.offset += 2;
    script.setUint8(state.life.opcodeOffset, 0x04); // override opcode to NEVERIF
}

export function ELSE(script, state, actor) {
    state.life.offset = script.getUint16(state.life.offset, true);
}

export function ENDIF(script, state, actor) {

}

export function OR_IF(script, state, actor) {
    if (testCondition(script, state)) {
        state.life.offset = script.getUint16(state.life.offset, true);
        return;
    }
    state.life.offset += 2;
}

export function COMPORTEMENT(script, state, actor) {
    
}

export function SET_COMPORTEMENT(script, state, actor) {
    state.life.reentryOffset = script.getUint16(state.life.offset, true);
    state.life.offset += 2;
}

export function SET_COMPORTEMENT_OBJ(script, state, actor) {
    const actorIndex = script.getUint8(state.life.offset++, true);
    const reentryOffsetActor = script.getUint16(state.life.offset, true);
    // TODO set entry offset for actor in actorIndex
    state.life.offset += 2;
}

export function END_COMPORTEMENT(script, state, actor) {
    state.life.continue = false;
}

export function AND_IF(script, state, actor) {
    if (!testCondition(script, state)) {
        state.life.offset = script.getUint16(state.life.offset, true);
        return;
    }
    state.life.offset += 2;
}

export function SWITCH(script, state, actor) {
    const {condition, value1} = getCondition(script, state);
    state.life.switchCondition = condition;
    state.life.switchValue1 = value1;
}

export function OR_CASE(script, state, actor) {
    const offset = script.getUint16(state.life.offset, true);
    state.life.offset += 2;
    if (!testSwitchCondition(script, state, state.life.switchCondition, state.life.switchValue1)) {
        state.life.offset = offset;
        return;
    }
    state.life.switchConditionTest = true;
}

export function CASE(script, state, actor) {
    const offset = script.getUint16(state.life.offset, true);
    state.life.offset += 2;
    if (!state.life.switchConditionTest && !testSwitchCondition(script, state, state.life.switchCondition, state.life.switchValue1)) {
        state.life.offset = offset;
        return;
    }
    state.life.switchConditionTest = false;
}

export function DEFAULT(script, state, actor) {

}

export function BREAK(script, state, actor) {
    state.life.offset = script.getUint16(state.life.offset, true);
}

export function END_SWITCH(script, state, actor) {
    state.life.switchCondition = null;
    state.life.switchValue1 = 0;
    state.life.switchConditionTest = false;
}
