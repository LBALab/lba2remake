import {find, each} from 'lodash';
import {state} from './state';
import {dbgHUD} from './elements';
import {parse, generate} from './exprDSL';
import NodeType from './exprDSL/types';
import {clearContent} from './utils';
import {saveDefaultProfile} from './profiles';

const Type = {
    MACRO: 0,
    EXPR: 1
};

export function addSlot(input) {
    const slot = compileSlot(input);
    if (slot) {
        if (slot.type === Type.EXPR) {
            if (!find(state.exprSlots, s => slot.value.normalized === s.normalized)) {
                state.exprSlots.push(slot.value);
                return true;
            }
        } else {
            state.macroSlots[slot.value.name] = slot.value;
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

export function refreshSlots(save = true) {
    clearContent(dbgHUD.macros);
    clearContent(dbgHUD.expressions);
    let found = false;
    each(state.macroSlots, slot => {
        createMacroSlotElement(slot);
        dbgHUD.macros.appendChild(slot.element);
        found = true;
    });
    dbgHUD.macros.style.display = found ? 'block' : 'none';
    found = false;
    each(state.exprSlots, slot => {
        createExprSlotElement(slot);
        dbgHUD.expressions.appendChild(slot.element);
        found = true;
    });
    dbgHUD.expressions.style.display = found ? 'block' : 'none';
    if (save) {
        saveDefaultProfile();
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
