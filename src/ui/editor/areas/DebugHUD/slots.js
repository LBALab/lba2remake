import {find, each} from 'lodash';
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
}

function createMacroSlotElement(slot) {
    if (!slot.element) {
        const button = document.createElement('button');
        const content = document.createElement('span');
        button.innerText = '-';
        content.innerText = ` ${slot.expr}`;
        content.style.color = 'aqua';
        slot.element = document.createElement('div');
        slot.element.style.background = 'darkslategrey';
        slot.element.appendChild(button);
        slot.element.appendChild(content);
        button.onclick = () => {
            delete state.macroSlots[slot.name];
            refreshSlots();
        }
    }
}

function createExprSlotElement(slot) {
    if (!slot.element) {
        const button = document.createElement('button');
        const content = document.createElement('span');
        const title = document.createElement('span');
        title.innerText = ` ${slot.expr}: `;
        button.innerText = '-';
        slot.element = document.createElement('div');
        slot.element.appendChild(button);
        slot.element.appendChild(title);
        slot.element.appendChild(content);
        slot.content = content;
        slot.title = title;
        button.onclick = () => {
            const idx = state.exprSlots.indexOf(slot);
            state.exprSlots.splice(idx, 1);
            refreshSlots();
        }
    }
}
