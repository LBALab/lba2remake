import React from 'react';
import {makeContentComponent} from './OutlinerArea/content';
import {SceneNode} from './OutlinerArea/nodes/scene';
import {LocationsNode} from './OutlinerArea/nodes/locations/index';

function makeOutlinerArea(id, name, content) {
    return {
        id: id,
        name: name,
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

export const SceneOutliner = makeOutlinerArea('scene_outliner', 'Scene Outliner', SceneNode);
export const Locator = makeOutlinerArea('locator', 'Locator', LocationsNode);

export const IslandOutliner = makeOutlinerArea('islands_list', 'Islands', {
    name: 'Islands',
    children: []
});
