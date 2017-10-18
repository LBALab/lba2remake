import React from 'react';
import DebugData from '../../../DebugData';
import {ActorsNode} from './actors';
import {ZonesNode} from './zones';
import {PointsNode} from './points';
import {SceneGraphNode} from './sceneGraph';

const sceneChildren = [
    ActorsNode/*,
    ZonesNode,
    PointsNode,
    SceneGraphNode*/
];

export const SceneNode = {
    dynamic: true,
    name: () => 'Scene',
    numChildren: () => {
        const scene = DebugData.scope.scene;
        return scene ? sceneChildren.length : 0;
    },
    child: (data, idx) => sceneChildren[idx],
    childData: () => DebugData.scope.scene,
    props: () => {
        const scene = DebugData.scope.scene;
        return scene ? [
            {
                id: 'index',
                value: scene.index,
                render: (value) => <span>#{value}</span>
            }
        ] : [];
    }
};
