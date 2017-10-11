import React from 'react';
import DebugHUD from './DebugHUDArea/hud';
import {Status} from './DebugHUDArea/status';
import {editor as editorStyle} from '../../styles';
import {
    loadDefaultProfile,
    saveDefaultProfile,
    loadProfiles,
    saveProfiles
} from './DebugHUDArea/profiles';
import {addSlot} from './DebugHUDArea/slots';
import {each, map, concat} from 'lodash';

const DebugHUDArea = {
    name: 'Debug HUD',
    menu: DebugHUDMenu,
    content: DebugHUD,
    sharedState: () => ({
        status: Status.NORMAL,
        slots: loadDefaultProfile(),
        profiles: loadProfiles(),
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
            saveDefaultProfile(slots);
        },
        loadProfile: function(profile, name) {
            const slots = {
                macros: {},
                expressions: []
            };
            each(profile, addSlot.bind(null, slots));
            this.setState({slots, status: Status.NORMAL, profileName: name});
            saveDefaultProfile(slots);
        },
        saveProfile: function(name) {
            if (name && name.length > 0) {
                const {slots, profiles} = this.state;
                profiles[name] = concat(
                    map(slots.macros, 'expr'),
                    map(slots.expressions, 'expr')
                );
                this.setState({profiles, status: Status.NORMAL, profileName: name});
                saveProfiles(profiles);
            }
        },
        removeProfile: function(name) {
            const profiles = this.state.profiles;
            delete profiles[name];
            this.setState({profiles});
            saveProfiles(profiles);
        }
    }
};

export default DebugHUDArea;

function DebugHUDMenu(props) {
    const {setStatus, newProfile} = props.stateHandler;
    if (props.sharedState.status === Status.NORMAL) {
        return <span>
            <button style={editorStyle.button} onClick={newProfile}>New</button>
            <button style={editorStyle.button} onClick={setStatus.bind(null, Status.LOAD)}>Load</button>
            <button style={editorStyle.button} onClick={setStatus.bind(null, Status.SAVE)}>Save</button>
        </span>;
    } else {
        return <button style={editorStyle.button} onClick={setStatus.bind(null, Status.NORMAL)}>Cancel</button>;
    }
}