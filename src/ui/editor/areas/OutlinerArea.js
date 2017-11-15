import React from 'react';
import {map, drop} from 'lodash';
import {SceneNode} from './OutlinerArea/nodes/scene';
import {makeOutlinerArea} from "./OutlinerArea/factory";
import {findScenePath, LocationsNode, LocatorMenu} from './OutlinerArea/nodes/locations/index';
import DebugData from "../DebugData";

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
    },
    style: {
        background: '#111111'
    }
});

export const IslandOutliner = makeOutlinerArea('islands_list', 'Islands', {
    name: 'Islands',
    children: []
});

