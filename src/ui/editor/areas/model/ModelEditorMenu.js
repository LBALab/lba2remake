import React from 'react';

const inputStyle = {
    textAlign: 'center',
    verticalAlign: 'middle'
};

export default function ModelEditorMenu(props) {
    const setRotateView = (e) => {
        props.stateHandler.setRotateView(e.target.checked);
    };

    const setWireframe = (e) => {
        props.stateHandler.setWireframe(e.target.checked);
    };

    const setGrid = (e) => {
        props.stateHandler.setGrid(e.target.checked);
    };

    const rv = props.sharedState.rotateView;
    const wf = props.sharedState.wireframe;
    const gd = props.sharedState.grid;

    return <span>
        <label style={{cursor: 'pointer'}}><input type="checkbox" onChange={setGrid} checked={gd} style={inputStyle}/>Grid</label>
        &nbsp;
        <label style={{cursor: 'pointer'}}><input type="checkbox" onChange={setWireframe} checked={wf} style={inputStyle}/>Wireframe</label>
        &nbsp;
        <label style={{cursor: 'pointer'}}><input type="checkbox" onChange={setRotateView} checked={rv} style={inputStyle}/>Rotate view</label>
    </span>;
}
