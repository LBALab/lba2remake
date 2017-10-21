import React from 'react';
import {map} from 'lodash';

const NewArea = {
    id: 'new_area',
    name: 'New area',
    content: NewAreaContent,
    getInitialState: () => ({})
};

export default NewArea;

function NewAreaContent(props) {
    return <ul>{map(props.availableAreas, (area, idx) => {
        return <li key={idx} style={{fontSize: 20, cursor: 'pointer'}} onClick={props.selectAreaContent.bind(null, area)}>{area.name}</li>;
    })}</ul>;
}
