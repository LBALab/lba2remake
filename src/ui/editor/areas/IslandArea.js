import React from 'react';
import Island from './IslandArea/content';
import {Type} from '../layout';

const IslandArea = {
    id: 'island',
    name: 'Island Editor',
    content: Island,
    mainArea: true,
    getInitialState: () => ({}),
    stateHandler: {},
    toolAreas: [],
    defaultLayout: {
        type: Type.AREA,
        content_id: 'island',
        root: true
    }
};

export default IslandArea;
