import {map, each, concat} from 'lodash';
import {addSlot} from './slots';

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

