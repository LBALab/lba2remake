import * as React from 'react';

const inputStyle = {
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    marginRight: '1ch'
};

export default function ModelEditorSettings(props) {
    const setWireframe = (e) => {
        props.stateHandler.setWireframe(e.target.checked);
    };

    const setGrid = (e) => {
        props.stateHandler.setGrid(e.target.checked);
    };

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
    </div>;
}
