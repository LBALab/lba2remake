import React from 'react';

const inputStyle = {
    textAlign: 'center',
    verticalAlign: 'middle'
};

export default function ModelEditorMenu(props) {
    const setRotateView = (e) => {
        props.stateHandler.setRotateView(e.target.checked);
    };

    const rv = props.sharedState.rotateView;

    return <span>
        <label style={{cursor: 'pointer'}}><input type="checkbox" onChange={setRotateView} checked={rv} style={inputStyle}/>Rotate view</label>
    </span>;
}
