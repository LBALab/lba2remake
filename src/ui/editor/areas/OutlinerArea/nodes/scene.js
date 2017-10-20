import React from 'react';
import DebugData from '../../../DebugData';
import {ActorsNode} from './actors';
import {ZonesNode} from './zones';
import {PointsNode} from './points';
import {SceneGraphNode} from './sceneGraph';
import {size, sortBy, map, filter} from 'lodash';
import {makeVariables, Var} from "./variables";

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

const VarCube = makeVariables('varcube', 'Variables (cube)', () => {
    const scene = DebugData.scope.scene;
    if (scene) {
        return scene.variables;
    }
    return [];
});

const VarGame = {
    dynamic: true,
    name: () => 'Variables (game)',
    numChildren: () => {
        const scene = DebugData.scope.scene;
        if (scene) {
            return scene.usedVarGames.length;
        }
    },
    child: () => Var,
    childData: (data, idx) => {
        const {scene, game} = DebugData.scope;
        if (scene && game) {
            const varGame = scene.usedVarGames[idx];
            const state = game.getState();
            return {
                type: 'vargame',
                value: () => state.flags.quest[varGame],
                idx: varGame
            };
        }
    }
};

const getChildren = () => {
    const scene = DebugData.scope.scene;
    if (scene) {
        let children = map(baseChildren);
        if (scene.sideScenes) {
            children.push(Siblings);
        }
        children.push(VarCube);
        children.push(VarGame);
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
