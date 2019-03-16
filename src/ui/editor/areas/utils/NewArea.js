import React from 'react';
import {map} from 'lodash';

const NewArea = {
    id: 'new_area',
    name: 'New area',
    content: NewAreaContent,
    getInitialState: () => ({})
};

export default NewArea;

const style = {
    position: 'relative',
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: '20px',
    cursor: 'pointer',
    padding: '5px 15px',
    marginLeft: 8,
    marginTop: 14,
    marginRight: 8,
    border: '1px solid #bbbbbb',
    boxShadow: '0 3px 2px rgba(0, 0, 0, 0.5)'
};

export function NewAreaContent(props) {
    return <div>{map(props.availableAreas, (area, idx) => {
        const icon = area.icon || 'default.png';
        return <div
            key={idx}
            onClick={props.selectAreaContent.bind(null, area)}
            style={style}
        >
            <img style={{position: 'absolute', left: 10, top: 5, width: 20, height: 20}} src={`editor/icons/areas/${icon}`}/>
            <span style={{paddingLeft: 25}}>{area.name}</span>
        </div>;
    })}</div>;
}
