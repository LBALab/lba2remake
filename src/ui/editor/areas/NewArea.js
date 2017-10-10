import React from 'react';
import {map} from 'lodash';

const NewArea = {
    name: 'New area',
    content: NewAreaContent
};

export default NewArea;

function NewAreaContent(props) {
    return <ul>{map(props.availableAreas, (area, idx) => {
        return <li key={idx} style={{fontSize: 20, cursor: 'pointer'}} onClick={props.selectAreaContent.bind(null, area)}>{area.name}</li>;
    })}</ul>;
}