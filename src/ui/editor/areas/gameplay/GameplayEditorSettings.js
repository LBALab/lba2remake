import React from 'react';

const inputStyle = {
    textAlign: 'center',
    verticalAlign: 'middle',
    marginRight: '1ch'
};

const headerStyle = {
    marginBottom: '1ch',
    marginRight: '2ch',
    fontSize: 16,
};

const lineStyle = {
    height: 20,
    lineHeight: '20px',
    fontSize: 14,
    verticalAlign: 'middle'
};

const iconStyle = {
    width: 14,
    height: 14,
    marginRight: '4px'
};

export default function GameplayEditorSettings(props) {
    const changeLabel = (type, e) => {
        props.stateHandler.setLabel(type, e.target.checked);
    };

    const l = props.sharedState.labels;

    return <div>
        <div style={headerStyle}>Display bounding boxes:</div>
        <div style={lineStyle}>
            <label>
                <input type="checkbox" onChange={changeLabel.bind(null, 'actor')} checked={l.actor} style={inputStyle}/>
                <img style={iconStyle} src="editor/icons/actor.svg"/>
                Actors
            </label>
        </div>
        <div style={lineStyle}>
            <label>
                <input type="checkbox" onChange={changeLabel.bind(null, 'zone')} checked={l.zone} style={inputStyle}/>
                <img style={iconStyle} src="editor/icons/zone.svg"/>
                Zones
            </label>
        </div>
        <div style={lineStyle}>
            <label>
                <input type="checkbox" onChange={changeLabel.bind(null, 'point')} checked={l.point} style={inputStyle}/>
                <img style={iconStyle} src="editor/icons/point.svg"/>
                Points
            </label>
        </div>
    </div>;
}
