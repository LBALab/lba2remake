import React from 'react';
import {extend} from 'lodash';
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
        stateHandler: extend({
            setPath: function(path) {
                this.setState({path: path});
            }
        }, extensions.stateHandler)
    };
}

export const SceneOutliner = makeOutlinerArea('scene_outliner', 'Scene Outliner', SceneNode);

export const Locator = makeOutlinerArea('locator', 'Locator', LocationsNode, {
    menu: LocatorMenu,
    stateHandler: {
        setActivePath: function(activePath, path) {
            this.setState({ activePath, path });
        }
    }
});

export const IslandOutliner = makeOutlinerArea('islands_list', 'Islands', {
    name: 'Islands',
    children: []
});
