import React from 'react';
import DebugData from '../../../DebugData';
import {ActorsNode} from './actors';
import {ZonesNode} from './zones';
import {PointsNode} from './points';
import {SceneGraphNode} from './sceneGraph';
import {size, sortBy, map} from 'lodash';
import {makeVariables} from "./variables";

const baseChildren = [
    ActorsNode,
    ZonesNode,
    PointsNode
];

const SubScene = {
    dynamic: true,
    name: (scene) => `Scene_${scene.index}`,
    numChildren: () => {
        const scene = DebugData.scope.scene;
        return scene ? baseChildren.length : 0;
    },
    child: (scene, idx) => baseChildren[idx],
    childData: (scene, idx) => scene,
    onClick: () => {}
};

const Siblings = {
    dynamic: true,
    name: () => 'Siblings',
    numChildren: (scene) => size(scene.sideScenes),
    child: () => SubScene,
    childData: (scene, idx) => sortBy(scene.sideScenes)[idx],
    onClick: () => {}
};

const VarCube = makeVariables('varcube', 'Variables', () => {
    const scene = DebugData.scope.scene;
    if (scene) {
        return scene.variables;
    }
    return [];
});

const getChildren = () => {
    const scene = DebugData.scope.scene;
    if (scene) {
        let children = map(baseChildren);
        if (scene.sideScenes) {
            children.push(Siblings);
        }
        children.push(VarCube);
        if (scene.threeScene) {
            children.push(SceneGraphNode);
        }
        return children;
    } else {
        return [];
    }
};

export const SceneNode = {
    dynamic: true,
    name: () => 'Scene',
    numChildren: () => getChildren().length,
    child: (data, idx) => getChildren()[idx],
    childData: (data, idx) => {
        const scene = DebugData.scope.scene;
        const child = getChildren()[idx];
        if (child.type === SceneGraphNode.type) {
            return scene && scene.threeScene;
        } else {
            return scene;
        }
    },
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
