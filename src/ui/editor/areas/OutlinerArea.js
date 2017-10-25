import React from 'react';
import {makeContentComponent} from './OutlinerArea/content';
import {SceneNode} from './OutlinerArea/nodes/scene';
import {LocationsNode, LocatorMenu} from './OutlinerArea/nodes/locations/index';

function makeOutlinerArea(id, name, content, extensions = {}) {
    return {
        id: id,
        name: name,
        menu: extensions.menu,
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

export const Locator = makeOutlinerArea('locator', 'Locator', LocationsNode, {
    menu: LocatorMenu
});

export const IslandOutliner = makeOutlinerArea('islands_list', 'Islands', {
    name: 'Islands',
    children: []
});
