import * as React from 'react';

const inputStyle = {
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    marginRight: '1ch'
};

const lineStyle = {
    height: 20,
    lineHeight: '20px',
    fontSize: 14,
    verticalAlign: 'middle' as const
};

export default function ModelEditorSettings(props) {
    const setWireframe = (e) => {
        props.stateHandler.setWireframe(e.target.checked);
    };
    const setFog = (e) => {
        props.stateHandler.setFog(e.target.checked);
    };

    const wf = props.sharedState.wireframe;
    const fog = props.sharedState.fog;

    return <div>
        <div style={lineStyle}>
            <label style={{cursor: 'pointer'}}>
                <input type="checkbox" onChange={setFog} checked={fog} style={inputStyle}/>
                Fog
            </label>
        </div>
        <div style={lineStyle}>
            <label style={{cursor: 'pointer'}}>
                <input type="checkbox" onChange={setWireframe} checked={wf} style={inputStyle}/>
                Wireframe
            </label>
        </div>
    </div>;
}
