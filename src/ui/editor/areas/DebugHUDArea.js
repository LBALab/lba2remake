import React from 'react';
import DebugHUD from './DebugHUDArea/hud';
import {Status} from './DebugHUDArea/status';
import {editor as editorStyle} from '../../styles';
import {
    loadDefaultProfile,
    saveDefaultProfile,
    saveProfiles,
    loadProfiles
} from './DebugHUDArea/profiles';
import {addSlot} from './DebugHUDArea/slots';
import {each, map, concat, isEmpty} from 'lodash';

const DebugHUDArea = {
    name: 'Debug HUD',
    menu: DebugHUDMenu,
    content: DebugHUD,
    getInitialState: () => ({
        status: Status.NORMAL,
        slots: loadDefaultProfile(),
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

function DebugHUDMenu(props) {
    const {setStatus, newProfile} = props.stateHandler;
    const slots = props.sharedState.slots;
    let newProfileConfirm = newProfile;
    if (slots.expressions.length > 0 || !isEmpty(slots.macros)) {
        const msg = <span>
                    Creating a new profile will clear the current window.
                    <br/><br/>
                    All expressions will be removed.
                    <br/><br/>
                </span>;
        newProfileConfirm = props.confirmPopup.bind(null, msg, 'Create new profile!', 'Cancel', newProfile);
    }
    if (props.sharedState.status === Status.NORMAL) {
        return <span>
            <button style={editorStyle.button} onClick={newProfileConfirm}>New</button>
            <button style={editorStyle.button} onClick={setStatus.bind(null, Status.LOAD)}>Load</button>
            <button style={editorStyle.button} onClick={setStatus.bind(null, Status.SAVE)}>Save</button>
        </span>;
    } else {
        return <button style={editorStyle.button} onClick={setStatus.bind(null, Status.NORMAL)}>Cancel</button>;
    }
}