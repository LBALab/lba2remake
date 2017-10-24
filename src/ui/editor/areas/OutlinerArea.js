import React from 'react';
import {makeContentComponent} from './OutlinerArea/content';
import {SceneNode} from './OutlinerArea/nodes/scene';
import {GameNode} from './OutlinerArea/nodes/game';
import {LocationsNode} from './OutlinerArea/nodes/locations/index';

function makeOutlinerArea(id, content) {
    return {
        id: `outliner_${id}`,
        name: 'Outliner',
        content: makeContentComponent(content),
        getInitialState: () => ({
            path: []
        }),
        stateHandler: {
            setPath: function(path) {
                this.setState({path: path});
            }
        }
    };
}

export const GameOutliner = makeOutlinerArea('game', {
    name: 'LBA2',
    children: [
        SceneNode,
        GameNode,
        LocationsNode
    ]
});

export const IslandOutliner = makeOutlinerArea('island', {
    name: 'Islands',
    children: []
});
