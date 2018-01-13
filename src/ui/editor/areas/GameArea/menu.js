import React from 'react';

const inputStyle = {
    textAlign: 'center',
    verticalAlign: 'middle'
};

export function GameMenu(props) {
    const changeLabel = (type, e) => {
        props.stateHandler.setLabel(type, e.target.checked);
    };

    const l = props.sharedState.labels;

    return <span>
        <label style={{color: 'red'}}><input type="checkbox" onChange={changeLabel.bind(null, 'actor')} checked={l.actor} style={inputStyle}/>Actors</label>
        &nbsp;
        <label style={{color: 'lime'}}><input type="checkbox" onChange={changeLabel.bind(null, 'zone')} checked={l.zone} style={inputStyle}/>Zones</label>
        &nbsp;
        <label style={{color: 'lightskyblue'}}><input type="checkbox" onChange={changeLabel.bind(null, 'point')} checked={l.point} style={inputStyle}/>Points</label>
    </span>;
}
