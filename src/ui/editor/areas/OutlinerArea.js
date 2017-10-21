import React from 'react';
import OutlinerContent from './OutlinerArea/content';

const OutlinerArea = {
    id: 'outliner',
    name: 'Outliner',
    content: OutlinerContent,
    getInitialState: () => ({
        path: []
    }),
    stateHandler: {
        setPath: function(path) {
            this.setState({path: path});
        }
    }
};

export default OutlinerArea;
