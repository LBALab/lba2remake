import React from 'react';
import {isEmpty} from 'lodash';
import {editor as editorStyle} from '../../../styles';
import {Status} from './status';

export default function DebugHUDMenu(props) {
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
            <button style={editorStyle.button} onClick={newProfileConfirm}>
                New
            </button>
            <button style={editorStyle.button} onClick={setStatus.bind(null, Status.LOAD)}>
                Load
            </button>
            <button style={editorStyle.button} onClick={setStatus.bind(null, Status.SAVE)}>
                Save
            </button>
        </span>;
    }
    return <button style={editorStyle.button} onClick={setStatus.bind(null, Status.NORMAL)}>
        Cancel
    </button>;
}
