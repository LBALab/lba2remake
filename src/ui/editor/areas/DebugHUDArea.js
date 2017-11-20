import React from 'react';
import DebugHUD from './DebugHUDArea/content';
import DebugHUDMenu from './DebugHUDArea/menu';
import {Status} from './DebugHUDArea/status';
import {saveProfiles, loadProfiles} from './DebugHUDArea/profiles';
import {addSlot} from './DebugHUDArea/slots';
import {each, map, concat} from 'lodash';

const DebugHUDArea = {
    id: 'dbg_hud',
    name: 'Debug HUD',
    icon: 'terminal.png',
    menu: DebugHUDMenu,
    content: DebugHUD,
    getInitialState: () => ({
        status: Status.NORMAL,
        slots: {macros: {}, expressions: []},
        profileName: ''
    }),
    stateHandler: {
        setStatus: function(status) {
            this.setState({status});
        },
        setSlots: function(slots) {
            this.setState({slots});
        },
        newProfile: function() {
            const slots = {
                macros: {},
                expressions: []
            };
            this.setState({slots, profileName: 'new_profile'});
        },
        loadProfile: function(profile, name) {
            const slots = {
                macros: {},
                expressions: []
            };
            each(profile, addSlot.bind(null, slots));
            this.setState({slots, status: Status.NORMAL, profileName: name});
        },
        saveProfile: function(confirm, name) {
            const {slots} = this.state;
            const profiles = loadProfiles();

            if (name && name.length > 0) {
                const doSave = () => {
                    profiles[name] = concat(
                        map(slots.macros, 'expr'),
                        map(slots.expressions, 'expr')
                    );
                    this.setState({status: Status.NORMAL, profileName: name});
                    saveProfiles(profiles);
                };
                if (name in profiles) {
                    confirm(doSave);
                } else {
                    doSave();
                }
            }
        },
        removeProfile: function(name) {
            const profiles = loadProfiles();
            delete profiles[name];
            saveProfiles(profiles);
        }
    }
};

export default DebugHUDArea;
