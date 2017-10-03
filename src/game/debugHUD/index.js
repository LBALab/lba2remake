import {map, each, find, concat} from 'lodash';
import {parse, generate, execute} from './exprDSL';
import NodeType from './exprDSL/types';
import autoComplete from './autocomplete';
import {mapValue} from './formatter';

window.parse = parse;
window.generate = generate;
window.execute = execute;

let debugBox = null;
let debugContent = null;
let debugInput = null;
let debugDataList = null;
let exprSlots = [];
let macroSlots = {};
let needSelectorRefresh = true;
let enabled = false;

const Type = {
    MACRO: 0,
    EXPR: 1
};

export function initDebugHUD() {
    debugBox = document.getElementById('debugBox');
    debugContent = document.querySelector('#debugBox .content');
    debugInput = document.querySelector('#debugBox .selector input');
    debugDataList = document.querySelector('#debugBox .selector datalist');
    document.querySelector('#debugBox .selector button').onclick = validateInput;
    debugInput.onkeydown = event => {
        const key = event.code || event.which || event.keyCode;
        if (key === 'Enter' || key === 13) {
            validateInput();
        } else if (key === 'Tab' || key === 9) {
            if (debugDataList.children.length > 0) {
                debugInput.value = debugDataList.children[0].value;
            }
            event.preventDefault();
        }
        event.stopPropagation();
        needSelectorRefresh = true;
    };
    debugInput.onkeyup = event => {
        event.stopPropagation();
    };
    debugContent.addEventListener('mouseup', e => {
        for (let i = 0; i < e.path.length; ++i) {
            if (e.path[i].classList && e.path[i].classList.contains('link')) {
                let expr = e.path[i].title;
                const m = expr.match(/^ *sort *\((.*)\) *(\[\d+\]) *$/);
                if (m) {
                    expr = m[1] + m[2];
                }
                addSlot(expr);
                refreshSlots();
                break;
            }
        }
    });
    loadHUDSetup();
}

export function debugHUDFrame(scope) {
    if (enabled) {
        if (needSelectorRefresh) {
            refreshSelector(scope);
            needSelectorRefresh = false;
        }
        each(exprSlots, slot => {
            try {
                let tgt = execute(slot.program, [scope], macroSlots);
                if (tgt !== undefined && tgt !== null) {
                    slot.title.style.color = 'white';
                } else {
                    slot.title.style.color = 'darkgrey';
                }
                slot.content.innerHTML = mapValue(slot.expr, tgt);
            }
            catch (e) {
                slot.title.style.color = 'darkgrey';
                slot.content.innerHTML = `<i style="color:darkred;">${e.toString()}</i>`;
            }
        });
    }
}

export function switchHUD() {
    enabled = !enabled;
    console.log('Switching debug HUD: ', enabled ? 'ON' : 'OFF');
    debugBox.style.display = enabled ? 'block' : 'none';
    saveHUDSetup();
}

export function refreshSlots(save = true) {
    while (debugContent.hasChildNodes()) {
        debugContent.removeChild(debugContent.lastChild);
    }
    each(macroSlots, slot => {
        createMacroSlotElement(slot);
        debugContent.appendChild(slot.element);
    });
    each(exprSlots, slot => {
        createExprSlotElement(slot);
        debugContent.appendChild(slot.element);
    });
    if (save) {
        saveHUDSetup();
    }
}

export function refreshSelector(scope) {
    const data = autoComplete(debugInput.value, scope);
    debugDataList.innerHTML = data.html;
    debugInput.style.backgroundColor = data.color;
}

function createMacroSlotElement(slot) {
    if (!slot.element) {
        const button = document.createElement('button');
        const content = document.createElement('span');
        button.style.color = 'black';
        button.style.background = 'white';
        button.innerText = '-';
        content.innerText = ` ${slot.expr}`;
        content.style.color = 'aqua';
        slot.element = document.createElement('div');
        slot.element.style.background = 'darkslategrey';
        slot.element.appendChild(button);
        slot.element.appendChild(content);
        button.onclick = () => {
            delete macroSlots[slot.name];
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
        button.style.color = 'black';
        button.style.background = 'white';
        button.innerText = '-';
        slot.element = document.createElement('div');
        slot.element.appendChild(button);
        slot.element.appendChild(title);
        slot.element.appendChild(content);
        slot.content = content;
        slot.title = title;
        button.onclick = () => {
            const idx = exprSlots.indexOf(slot);
            exprSlots.splice(idx, 1);
            refreshSlots();
        }
    }
}

function loadHUDSetup() {
    if ('localStorage' in window) {
        const debug_hud_str = window.localStorage.getItem('debug_hud');
        if (debug_hud_str) {
            const debug_hud = JSON.parse(debug_hud_str);
            enabled = debug_hud.enabled;
            exprSlots = [];
            macroSlots = {};
            each(debug_hud.slots, slot => {
                addSlot(slot);
            });
            debugBox.style.display = enabled ? 'block' : 'none';
            refreshSlots(false);
        }
    }
}

function saveHUDSetup() {
    if ('localStorage' in window) {
        window.localStorage.setItem('debug_hud', JSON.stringify({
            enabled: enabled,
            slots: concat(map(macroSlots, 'expr'), map(exprSlots, 'expr'))
        }));
    }
}

function validateInput() {
    if (debugInput.value && addSlot(debugInput.value)) {
        debugInput.value = '';
        refreshSlots();
    }
}

function addSlot(input) {
    const slot = compileSlot(input);
    if (slot) {
        if (slot.type === Type.EXPR) {
            if (!find(exprSlots, s => slot.value.normalized === s.normalized)) {
                exprSlots.push(slot.value);
                return true;
            }
        } else {
            macroSlots[slot.value.name] = slot.value;
            return true;
        }
    }
    return false;
}

function compileSlot(expr) {
    const program = parse(expr);
    if (program && program.type === NodeType.ASSIGNMENT) {
        const name = program.left.value;
        return {type: Type.MACRO, value: { name, expr, program} };
    }
    if (program) {
        return {type: Type.EXPR, value: { expr, normalized: generate(program), program} };
    }
}
