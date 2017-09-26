import {
    map,
    take,
    each,
    find,
    isFunction,
    isArray,
    times,
    constant
} from 'lodash';
import THREE from 'three';

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
            const tgt = getValueFromLabel(scope, slot.label);
            if (tgt !== undefined && tgt !== null) {
                slot.title.style.color = 'white';
            } else {
                slot.title.style.color = 'darkgrey';
                //slot.content.innerHTML = '<span style="color:darkgrey;font-style:italic;"></span>';
            }
            slot.content.innerHTML = mapValue(tgt);
        });
    }
}

function getValueFromLabel(scope, label) {
    const path = label.split('.');

    let obj = scope;
    let i = 0;
    while (obj !== undefined && obj !== null && i < path.length) {
        const arrayExpr = path[i].match(/(\w+)\[(\d+)\]/);
        if (arrayExpr)
            obj = obj[arrayExpr[1]][arrayExpr[2]];
        else
            obj = obj[path[i]];
        ++i;
    }
    return obj;
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
    const label = debugInput.value;
    const path = label.split('.');

    let obj = scope;
    let i = 0;
    let prefix = '';
    while (i < path.length) {
        const arrayExpr = path[i].match(/(\w+)\[(\d+)\]/);
        const prevObj = obj;

        if (arrayExpr)
            obj = obj[arrayExpr[1]][arrayExpr[2]];
        else
            obj = obj[path[i]];

        if (obj === undefined || obj === null) {
            obj = prevObj;
            break;
        } else {
            prefix += path[i] + '.';
        }
        ++i;
    }
    debugDataList.innerHTML = map(obj, (value, label) => `<option>${prefix}${label}</option>`).join('');
}

function loadHUDSetup() {
    if ('localStorage' in window) {
        const debug_hud_str = window.localStorage.getItem('debug_hud');
        if (debug_hud_str) {
            const debug_hud = JSON.parse(debug_hud_str);
            enabled = debug_hud.enabled;
            debugSlots = map(debug_hud.slots, slot => ({ label: slot }));
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
            debugSlots.push({label: debugInput.value});
            debugInput.value = '';
            refreshSlots();
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
    if (isArray(value))
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
    return value;
}

const ARRAY_COLOR = ['red', 'lime', 'lightskyblue', 'yellow'];

function mapVector(vec) {
    const mapComp = (n, i) => `<span style="color:${ARRAY_COLOR[i]};">${n.toFixed(3)}</span>`;
    const va = vec.toArray();
    const components = map(va, mapComp);
    return `Vector${va.length}(${components.join(', ')})`;
}

function mapQuat(quat) {
    const mapComp = (n, i) => `<span style="color:${ARRAY_COLOR[i]};">${n.toFixed(3)}</span>`;
    const components = map(quat.toArray(), mapComp);
    return `Quaternion(${components.join(', ')})`;
}
