import React from 'react';

const inputStyle = {
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    marginRight: '1ch'
};

export default function ModelEditorSettings(props) {
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

    return <div>
        <div>
            <label style={{cursor: 'pointer'}}>
                <input type="checkbox" onChange={setGrid} checked={gd} style={inputStyle}/>
                Display grid
            </label>
        </div>
        <div>
            <label style={{cursor: 'pointer'}}>
                <input type="checkbox" onChange={setWireframe} checked={wf} style={inputStyle}/>
                Wireframe
            </label>
        </div>
        <div>
            <label style={{cursor: 'pointer'}}>
                <input type="checkbox" onChange={setRotateView} checked={rv} style={inputStyle}/>
                Auto-rotate view
            </label>
        </div>
    </div>;
}
