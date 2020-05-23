import * as React from 'react';
import { ZONE_TYPE } from '../../../../game/zones';

const inputStyle = {
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
    marginRight: '1ch'
};

const headerStyle = {
    marginTop: '1ch',
    marginBottom: '1ch',
    marginRight: '2ch',
    fontSize: 16,
};

const lineStyle = {
    height: 20,
    lineHeight: '20px',
    fontSize: 14,
    verticalAlign: 'middle' as const
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
    const setFog = (e) => {
        props.stateHandler.setFog(e.target.checked);
    };

    const l = props.sharedState.labels;
    const fog = props.sharedState.fog;

    return <div>
        <div style={lineStyle}>
            <label style={{cursor: 'pointer'}}>
                <input type="checkbox" onChange={setFog} checked={fog} style={inputStyle}/>
                Fog
            </label>
        </div>
        <div style={headerStyle}>Display labels:</div>
        <div style={lineStyle}>
            <label>
                <input type="checkbox"
                        onChange={changeLabel.bind(null, 'actor')}
                        checked={l.actor}
                        style={inputStyle}/>
                <img style={iconStyle} src="editor/icons/actor.svg"/>
                Actors
            </label>
        </div>
        <div style={lineStyle}>
            <label>
                <input type="checkbox"
                        onChange={changeLabel.bind(null, 'zone')}
                        checked={l.zone}
                        style={inputStyle}/>
                <img style={iconStyle} src="editor/icons/zone.svg"/>
                Zones
            </label>
        </div>
        {renderZoneTypes(props)}
        <div style={lineStyle}>
            <label>
                <input type="checkbox"
                        onChange={changeLabel.bind(null, 'point')}
                        checked={l.point}
                        style={inputStyle}/>
                <img style={iconStyle} src="editor/icons/point.svg"/>
                Points
            </label>
        </div>
    </div>;
}

function renderZoneTypes(props) {
    const changeZoneType = (type, e) => {
        props.stateHandler.setZoneTypeLabel(type, e.target.checked);
    };

    const selectedZoneTypes = props.sharedState.labels.zoneTypes || [];
    const inputs = ZONE_TYPE.map((type) => {
        const checked = selectedZoneTypes.includes(type);
        return <div key={type} style={lineStyle}>
            <label>
                <input type="checkbox"
                        onChange={changeZoneType.bind(null, type)}
                        checked={checked}
                        style={inputStyle}/>
                <img style={iconStyle} src={`editor/icons/zones/${type}.svg`}/>
                {type}
            </label>
        </div>;
    });
    return <div style={{paddingLeft: '3ch', paddingBottom: '4px'}}>
        {inputs}
    </div>;
}
