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
    const conditionIndex = script.getUint8(state.offset++, true);
    const condition = ConditionOpcode[conditionIndex];
    let param = null; 
    DEBUG.addLife(state.debug, " " + condition.command);
    if (condition.param) {
        param = script.getUint8(state.offset++, true);
    }
    const value1 = condition.callback(param);
    DEBUG.addLife(state.debug, " " + value1);
    return {
        condition,
        value1
    };
}

function testConditionOperand(script, state, condition, value1) {
    const operator = script.getUint8(state.offset++, true);
    let value2 = null;
    if (condition.value_size == 1) {
        value2 = script.getInt8(state.offset++, true);
    } else {
        value2 = script.getInt16(state.offset, true);
        state.offset += 2;
    }
    DEBUG.addLife(state.debug, " " + OperatorOpcode[operator].command + " " + value2);
    return testConditionValue(operator, value1, value2);
}

function testCondition(script, state) {
    const {condition, value1} = getCondition(script, state);
    return testConditionOperand(script, state, condition, value1);
}

function testSwitchCondition(script, state, condition, value1) {
    return testConditionOperand(script, state, condition, value1);
}



export function SNIF(script, state, actor) {
    if (!testCondition(script, state)) {
        state.offset = script.setUint8(state.opcodeOffset, 0x0D); // override opcode to SWIF
    }
    state.offset = script.getUint16(state.offset, true);
}

export function NEVERIF(script, state, actor) {
    testCondition(script, state);
    state.offset = script.getUint16(state.offset, true);
}

export function IF(script, state, actor) {
    if (!testCondition(script, state)) {
        state.offset = script.getUint16(state.offset, true);
    }
    state.offset += 2;
}

export function SWIF(script, state, actor) {
    if (!testCondition(script, state)) {
        state.offset = script.getUint16(state.offset, true);
    }
    state.offset += 2;
    state.offset = script.setUint8(state.opcodeOffset, 0x02); // override opcode to SNIF
}

export function ONEIF(script, state, actor) {
    if (!testCondition(script, state)) {
        state.offset = script.getUint16(state.offset, true);
    }
    state.offset += 2;
    state.offset = script.setUint8(state.opcodeOffset, 0x04); // override opcode to NEVERIF
}

export function ELSE(script, state, actor) {
    state.offset = script.getUint16(state.offset, true);
}

export function ENDIF(script, state, actor) {

}

export function OR_IF(script, state, actor) {
    if (testCondition(script, state)) {
        script.offset = script.getUint16(state.offset, true);
    }
    state.offset += 2;
}

export function AND_IF(script, state, actor) {
    if (!testCondition(script, state)) {
        script.offset = script.getUint16(state.offset, true);
    }
    state.offset += 2;
}

export function SWITCH(script, state, actor) {
    const {condition, value1} = getCondition(script, state);
    state.switchCondition = condition;
    state.switchValue1 = value1;
}

export function OR_CASE(script, state, actor) {
    const offset = script.getUint16(state.offset, true);
    state.offset += 2;
    if (testSwitchCondition(script, state, state.switchCondition, state.switchValue1)) {
        state.offset = offset;    
    }
}

export function CASE(script, state, actor) {
    const offset = script.getUint16(state.offset, true);
    state.offset += 2;
    if (!testSwitchCondition(script, state, state.switchCondition, state.switchValue1)) {
        state.offset = offset;    
    }
}

export function DEFAULT(script, state, actor) {

}

export function BREAK(script, state, actor) {
    state.offset = script.getUint16(state.offset, true);
}

export function END_SWITCH(script, state, actor) {
    state.switchCondition = null;
    state.switchValue1 = 0;
}
