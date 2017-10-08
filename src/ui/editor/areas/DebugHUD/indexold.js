import {each} from 'lodash';
import {execute} from './exprDSL/index';
import autoComplete from './exprDSL/autocomplete';
import {mapValue} from './formatter';
import {refreshSlots, addSlot} from './slots';
import {
    loadDefaultProfile, saveDefaultProfile,
    loadProfile, saveProfile,
    closePopup
} from './profiles';

export function initDebugHUD() {
    initHUDElements();
    document.getElementById('dbgHUD_popup_cancel').onclick = closePopup;
    document.getElementById('dbgHUD_new').onclick = () => {
        state.macroSlots = {};
        state.exprSlots = [];
        refreshSlots();
    };
    document.getElementById('dbgHUD_load').onclick = loadProfile;
    document.getElementById('dbgHUD_save').onclick = saveProfile;
    document.getElementById('dbgHUD_add').onclick = validateInput;
    dbgHUD.input.onkeydown = event => {
        const key = event.code || event.which || event.keyCode;
        if (key === 'Enter' || key === 13) {
            validateInput();
        } else if (key === 'Tab' || key === 9) {
            if (dbgHUD.completion.children.length > 0) {
                dbgHUD.input.value = dbgHUD.completion.children[0].value;
            }
            event.preventDefault();
        }
        event.stopPropagation();
        state.needSelectorRefresh = true;
    };
    dbgHUD.input.onkeyup = event => {
        event.stopPropagation();
    };
    dbgHUD.content.addEventListener('mouseup', e => {
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
    loadDefaultProfile();
}

export function debugHUDFrame(scope) {
    if (state.enabled) {
        if (state.needSelectorRefresh) {
            refreshSelector(scope);
            state.needSelectorRefresh = false;
        }
        each(state.exprSlots, slot => {
            try {
                let tgt = execute(slot.program, [scope], state.macroSlots);
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
    state.enabled = !state.enabled;
    console.log('Switching debug HUD: ', state.enabled ? 'ON' : 'OFF');
    dbgHUD.root.style.display = state.enabled ? 'block' : 'none';
    saveDefaultProfile();
}

export function refreshSelector(scope) {
    const data = autoComplete(dbgHUD.input.value, scope);
    dbgHUD.completion.innerHTML = data.html;
    dbgHUD.input.style.backgroundColor = data.color;
}

export function validateInput() {
    if (dbgHUD.input.value && addSlot(dbgHUD.input.value)) {
        dbgHUD.input.value = '';
        refreshSlots();
    }
}
