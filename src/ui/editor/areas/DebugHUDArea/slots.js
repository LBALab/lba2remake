import {find} from 'lodash';
import {parse, generate} from './exprDSL/index';
import NodeType from './exprDSL/types';

const Type = {
    MACRO: 0,
    EXPR: 1
};

export function addSlot(slots, input) {
    const slot = compileSlot(input);
    if (slot) {
        if (slot.type === Type.EXPR) {
            if (!find(slots.expressions, s => slot.value.normalized === s.normalized)) {
                slots.expressions.push(slot.value);
                return true;
            }
        } else {
            slots.macros[slot.value.name] = slot.value;
            return true;
        }
    }
    return false;
}

export function compileSlot(expr) {
    const program = parse(expr);
    if (program && program.type === NodeType.ASSIGNMENT) {
        const name = program.left.value;
        return {type: Type.MACRO, value: { name, expr, program} };
    }
    if (program) {
        return {type: Type.EXPR, value: { expr, normalized: generate(program), program} };
    }
    return null;
}
