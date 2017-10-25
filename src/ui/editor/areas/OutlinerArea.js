import React from 'react';
import {extend, map, drop} from 'lodash';
import {makeContentComponent} from './OutlinerArea/content';
import {SceneNode} from './OutlinerArea/nodes/scene';
import {findScenePath, LocationsNode, LocatorMenu} from './OutlinerArea/nodes/locations/index';
import DebugData from "../DebugData";

function makeOutlinerArea(id, name, content, extensions = {}) {
    return {
        id: id,
        name: name,
        menu: extensions.menu,
        content: makeContentComponent(content, extensions.frame),
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
    frame: function() {
        const scene = DebugData.scope.scene;
        if (scene !== this.scene) {
            this.scene = scene;
            if (scene) {
                const path = findScenePath(LocationsNode, scene.index);
                if (path) {
                    const activePath = map(drop(path), node => node.name);
                    this.props.stateHandler.setActivePath(activePath);
                }
            }
        }
    },
    stateHandler: {
        setActivePath: function(activePath) {
            this.setState({activePath});
        }
    }
});

export const IslandOutliner = makeOutlinerArea('islands_list', 'Islands', {
    name: 'Islands',
    children: []
});

