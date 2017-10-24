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
    fontSize: 18,
    fontWeight: 'normal',
    cursor: 'pointer',
    padding: 0,
    marginLeft: 14,
    marginTop: 14,
    display: 'inline-block',
    border: '1px solid white',
    boxShadow: '0 3px 2px rgba(0, 0, 0, 0.5)'
};

function NewAreaContent(props) {
    return <div>{map(props.availableAreas, (area, idx) => {
        return <div key={idx}
                    style={style}
                    onClick={props.selectAreaContent.bind(null, area)}>
            <div style={{padding: 5, background: '#191919'}}>{area.name}</div>
            <img style={{borderTop: '1px solid white'}} src={`editor/areas/${area.id}.png`}/>
        </div>;
    })}</div>;
}
