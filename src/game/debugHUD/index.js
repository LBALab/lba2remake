import {
    map,
    each,
    find,
    isFunction,
    isArray,
    times,
    constant
} from 'lodash';
import THREE from 'three';
import {parse, generate, execute} from './exprDSL';

import autoComplete from './autocomplete';

window.parse = parse;
window.generate = generate;
window.execute = execute;

let debugBox = null;
let debugContent = null;
let debugInput = null;
let debugDataList = null;
let debugSlots = [];
let needSelectorRefresh = true;
let enabled = false;

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
    loadHUDSetup();
}

export function debugHUDFrame(scope) {
    if (enabled) {
        if (needSelectorRefresh) {
            refreshSelector(scope);
            needSelectorRefresh = false;
        }
        each(debugSlots, slot => {
            try {
                let tgt = execute(slot.program, scope);
                if (tgt !== undefined && tgt !== null) {
                    slot.title.style.color = 'white';
                } else {
                    slot.title.style.color = 'darkgrey';
                }
                slot.content.innerHTML = mapValue(tgt);
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
    each(debugSlots, slot => {
        if (!slot.element) {
            const button = document.createElement('button');
            const content = document.createElement('span');
            const title = document.createElement('span');
            title.innerText = ` ${slot.label}: `;
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
                const idx = debugSlots.indexOf(slot);
                debugSlots.splice(idx, 1);
                refreshSlots();
            }
        }
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

function loadHUDSetup() {
    if ('localStorage' in window) {
        const debug_hud_str = window.localStorage.getItem('debug_hud');
        if (debug_hud_str) {
            const debug_hud = JSON.parse(debug_hud_str);
            enabled = debug_hud.enabled;
            debugSlots = map(debug_hud.slots, slot => ({ label: slot, program: parse(slot) }));
            debugBox.style.display = enabled ? 'block' : 'none';
            refreshSlots(false);
        }
    }
}

function saveHUDSetup() {
    if ('localStorage' in window) {
        window.localStorage.setItem('debug_hud', JSON.stringify({
            enabled: enabled,
            slots: map(debugSlots, slot => slot.label)
        }));
    }
}

function validateInput() {
    if (debugInput.value) {
        if (!find(debugSlots, slot => slot.label === debugInput.value)) {
            const program = parse(debugInput.value);
            if (program) {
                debugSlots.push({label: debugInput.value, program});
                debugInput.value = '';
                refreshSlots();
            }
        }
    }
}

function mapValue(value, root = true) {
    if (value === undefined || value === null)
        return `<span style="color:darkgrey;font-style:italic;">${value}</span>`;
    if (typeof(value) === 'string')
        return `<span style="color:orange;">"${value}"</span>`;
    if (isFunction(value))
        return `function(${times(value.length, constant('_')).join(', ')})`;
    if (isArray(value) && !root)
        return `[${value.length}]`;
    if (value instanceof Object) {
        if (value instanceof THREE.Vector2
            || value instanceof THREE.Vector3
            || value instanceof THREE.Vector4) {
            return mapVector(value);
        } else if (value instanceof THREE.Quaternion) {
          return mapQuat(value);
        } else if (root) {
            const marker = isArray(value) ? '[]' : '{}';
            const type = !isArray(value) && value.type ? `${value.type} ` : '';
            const subValues =
                isArray(value)
                    ? map(value, (v, key) => `&nbsp;&nbsp;[<span style="color:mediumpurple;">${key}</span>]: ${mapValue(v, false)}`)
                    : map(value, (v, key) => `&nbsp;&nbsp;<span style="color:mediumpurple;">${key}</span>: ${mapValue(v, false)}`);
            return`${type}${marker[0]}<br/>${subValues.join(',<br/>')}<br/>${marker[1]}`;
        } else if (value.type) {
            return `${value.type} {...}`;
        } else {
            return '{...}';
        }
    }
    if (typeof(value) === 'boolean')
        return `<span style="color:${value ? 'lime' : 'red'};font-style:italic;">${value}</span>`;
    if (typeof(value) === 'number' && !Number.isInteger(value)) {
        return value.toFixed(3);
    }
    return value;
}

const ARRAY_COLOR = ['red', 'lime', 'lightskyblue', 'yellow'];

function mapVector(vec) {
    const mapComp = (n, i) => `<span style="color:${ARRAY_COLOR[i]};">${n.toFixed(3)}</span>`;
    const va = vec.toArray();
    const components = map(va, mapComp);
    return `Vec${va.length}(${components.join(', ')})`;
}

function mapQuat(quat) {
    const mapComp = (n, i) => `<span style="color:${ARRAY_COLOR[i]};">${n.toFixed(3)}</span>`;
    const components = map(quat.toArray(), mapComp);
    return `Quat(${components.join(', ')})`;
}
