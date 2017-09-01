import {map} from 'lodash';

let debugBox = null;
let debugSlots = [];
let enabled = false;

export function initDebugHUD() {
    debugBox = document.getElementById('debugBox');
}

export function startDebugHUDFrame() {
    debugSlots = [];
}

export function endDebugHUDFrame() {
    if (enabled) {
        debugBox.innerHTML = debugSlots.join('<br/>');
    }
}

export function switchHUD() {
    enabled = !enabled;
    console.log('Switching debug HUD: ', enabled ? 'ON' : 'OFF');
    debugBox.style.display = enabled ? 'block' : 'none';
}

function debugValue(text, value) {
    if (enabled) {
        debugSlots.push(`${text}: ${value()}`);
    }
}

export function debugVector(text, vec) {
    debugValue(text, () => {
        const components = map(vec.toArray(), (n, i) => `<span style="color:${['Crimson', 'Lime', 'LightSkyBlue'][i]};">${n.toFixed(3)}</span>`);
        return components.join(', ');
    });
}
