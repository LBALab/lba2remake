import {map, each, concat} from 'lodash';
import {addSlot} from './slots';
import * as builtInProfiles from './builtInProfiles';

export function loadDefaultProfile() {
    const slots = {
        macros: {},
        expressions: []
    };
    const debug_hud_str = window.localStorage.getItem('debug_hud');
    if (debug_hud_str) {
        const debug_hud = JSON.parse(debug_hud_str);
        each(debug_hud.slots, addSlot.bind(null, slots));
    }
    return slots;
}

export function saveDefaultProfile(slots) {
    window.localStorage.setItem('debug_hud', JSON.stringify({
        slots: concat(
            map(slots.macros, 'expr'),
            map(slots.expressions, 'expr')
        )
    }));
}

export function loadProfiles() {
    const profiles_str = window.localStorage.getItem('debug_hud_profiles');
    if (profiles_str) {
        try {
            return JSON.parse(profiles_str);
        }
        catch (e) {}
    }
    return {};
}

export function saveProfiles(profiles) {
    window.localStorage.setItem('debug_hud_profiles', JSON.stringify(profiles));
}

export function listProfiles(profiles, showBuiltins, onClick) {
    if (showBuiltins) {
        each(builtInProfiles, (profile, name) => {
            const elem = document.createElement('div');
            elem.innerHTML = `&nbsp;&nbsp;&nbsp;${name}`;
            elem.style.fontStyle = 'italic';
            elem.style.cursor = 'pointer';
            elem.style.lineHeight = '22px';
            elem.onclick = () => onClick(profile, name);
            dbgHUD.popup_content.appendChild(elem);
        });
    }
    each(profiles, (profile, name) => {
        const elem = document.createElement('div');
        const button = document.createElement('button');
        const content = document.createElement('span');
        button.innerText = '-';
        button.onclick = () => confirm(`Are you sure you want to delete profile "${name}"?`, () => {
            delete profiles[name];
            dbgHUD.popup_content.removeChild(elem);
            window.localStorage.setItem('debug_hud_profiles', JSON.stringify(profiles));
        });
        content.innerText = ` ${name}`;
        content.style.cursor = 'pointer';
        content.onclick = () => onClick(profile, name);
        elem.appendChild(button);
        elem.appendChild(content);
        dbgHUD.popup_content.appendChild(elem);
    });
}
