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

export function loadProfile(state) {
    const profiles_str = window.localStorage.getItem('debug_hud_profiles');
    if (profiles_str) {
        const profiles = JSON.parse(profiles_str);
        listProfiles(profiles, true, (profile, name) => {
            state.macros = {};
            state.expressions = [];
            each(profile, slot => {
                addSlot(slot);
            });
            refreshSlots();
        });
    }
}

export function saveProfile(state) {
    dbgHUD.content.style.display = 'none';
    dbgHUD.popup.style.display = 'block';
    dbgHUD.popup_save.style.display = 'inline-block';
    dbgHUD.popup_input.style.display = 'inline-block';
    dbgHUD.popup_save.disabled = dbgHUD.popup_input.value.length === 0;
    const profiles_str = window.localStorage.getItem('debug_hud_profiles');
    const profiles = profiles_str ? JSON.parse(profiles_str) : {};

    function save(name = dbgHUD.popup_input.value) {
        const doSave = () => {
            profiles[name] = concat(
                map(state.macroSlots, 'expr'),
                map(state.exprSlots, 'expr')
            );
            window.localStorage.setItem('debug_hud_profiles', JSON.stringify(profiles));
            closePopup();
        };
        if (name) {
            if (name in profiles) {
                confirm(`Are you sure you want to overwrite profile "${name}"?`, doSave);
            } else {
                doSave();
            }
        }
    }

    dbgHUD.popup_save.onclick = () => save();

    dbgHUD.popup_input.onkeydown = event => {
        const key = event.code || event.which || event.keyCode;
        if (key === 'Enter' || key === 13) {
            save();
        }
        event.stopPropagation();
    };

    dbgHUD.popup_input.onkeyup = event => {
        event.stopPropagation();
        dbgHUD.popup_save.disabled = dbgHUD.popup_input.value.length === 0;
    };

    listProfiles(profiles, false, (profile, name) => {
        save(name);
    });
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
