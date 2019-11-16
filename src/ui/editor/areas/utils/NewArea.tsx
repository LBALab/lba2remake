import * as React from 'react';
import {map} from 'lodash';

const NewArea = {
    id: 'new_area',
    name: 'New area',
    content: Blank,
    style: {
        // tslint:disable-next-line:max-line-length
        backgroundImage: 'linear-gradient(-45deg, rgba(2,0,36,1) 0%, rgb(13, 20, 45) 35%, rgba(45,45,45,1) 100%)'
    },
    getInitialState: () => ({})
};

export default NewArea;

const wrapperStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    border: '1 px solid white',
    background: 'rgb(45, 45, 45)',
    overflowY: 'auto' as const,
    padding: 0,
    paddingBottom: 14,
    boxShadow: '3px 3px 50px 0px rgba(255, 255, 255, 0.3)',
    borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
    borderRight: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
};

const style = {
    position: 'relative' as const,
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: '20px',
    cursor: 'pointer' as const,
    padding: '5px 15px',
    marginLeft: 14,
    marginTop: 14,
    marginRight: 14,
    border: '2px solid #bbbbbb',
    borderRadius: 4,
    background: 'black',
    boxShadow: '0 3px 2px rgba(0, 0, 0, 0.5)'
};

function Blank() {
    return <div/>;
}

export function NewAreaContent(props) {
    return <div style={wrapperStyle}>{map(props.availableAreas, (area, idx) => {
        const icon = area.icon || 'default.png';
        return <div
            key={idx}
            onClick={props.selectAreaContent.bind(null, area)}
            style={style}
        >
            <img style={{position: 'absolute', left: 14, top: 5, width: 20, height: 20}}
                    src={`editor/icons/areas/${icon}`}/>
            <span style={{paddingLeft: 28}}>{area.name}</span>
        </div>;
    })}</div>;
}
