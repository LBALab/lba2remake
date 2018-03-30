import React from 'react';
import {size, sortBy, map, each, filter} from 'lodash';
import DebugData from '../../../DebugData';
import {ActorsNode} from './actors';
import {ZonesNode} from './zones';
import {PointsNode} from './points';
import {SceneGraphNode} from './sceneGraph';
import {makeVarDef, makeVariables, Var} from './variables';

const baseChildren = [
    ActorsNode,
    ZonesNode,
    PointsNode
];

const SubScene = {
    dynamic: true,
    name: scene => `Scene_${scene.index}`,
    numChildren: () => {
        const scene = DebugData.scope.scene;
        return scene ? baseChildren.length : 0;
    },
    child: (scene, idx) => baseChildren[idx],
    childData: scene => scene,
    onClick: () => {}
};

const Siblings = {
    dynamic: true,
    name: () => 'Siblings',
    numChildren: scene => size(scene.sideScenes),
    child: () => SubScene,
    childData: (scene, idx) => sortBy(scene.sideScenes)[idx],
    onClick: () => {}
};

const VarCube = makeVariables('varcube', 'Local Variables', () => {
    const scene = DebugData.scope.scene;
    if (scene) {
        return scene.variables;
    }
    return [];
}, () => {
    const scene = DebugData.scope.scene;
    if (scene) {
        return {
            scene: scene.index
        };
    }
    return null;
});

const VarGameConfig = {
    filterScene: true,
    filterInventory: false
};

const labelStyle = {
    fontSize: 12
};

const VarGame = {
    dynamic: true,
    name: () => 'Game Variables',
    icon: () => 'editor/icons/var.png',
    numChildren: () => {
        const {scene, game} = DebugData.scope;
        if (scene && game) {
            if (VarGameConfig.filterScene) {
                if (VarGameConfig.filterInventory) {
                    let count = 0;
                    each(scene.usedVarGames, (varGame) => {
                        if (varGame < 40)
                            count += 1;
                    });
                    return count;
                }
                return scene.usedVarGames.length;
            }
            return VarGameConfig.filterInventory ? 40 : game.getState().flags.quest.length;
        }
        return 0;
    },
    child: () => Var,
    childData: (data, idx) => {
        const {scene, game} = DebugData.scope;
        if (scene && game) {
            const state = game.getState();
            if (VarGameConfig.filterScene) {
                const usedVarGames = VarGameConfig.filterInventory
                    ? filter(scene.usedVarGames, vg => vg < 40)
                    : scene.usedVarGames;
                const varGame = usedVarGames[idx];
                if (varGame !== undefined) {
                    return makeVarDef('vargame', varGame, () => state.flags.quest, () => null);
                }
            } else {
                return makeVarDef('vargame', idx, () => state.flags.quest, () => null);
            }
        }
        return null;
    },
    props: data => [
        {
            id: 'filter_scene',
            value: data.filterScene,
            render: (value) => {
                const onChange = (e) => {
                    data.filterScene = e.target.checked;
                };
                return <label style={labelStyle} key="used"><input type="checkbox" checked={value} onChange={onChange}/>Only in scene&nbsp;</label>;
            }
        },
        {
            id: 'filter_inventory',
            value: data.filterInventory,
            render: (value) => {
                const onChange = (e) => {
                    data.filterInventory = e.target.checked;
                };
                return <label style={labelStyle} key="inventory"><input type="checkbox" checked={value} onChange={onChange}/>Only inventory</label>;
            }
        }
    ]
};

const getChildren = () => {
    const scene = DebugData.scope.scene;
    if (scene) {
        const children = map(baseChildren);
        children.push(VarCube);
        children.push(VarGame);
        if (scene.sideScenes) {
            children.push(Siblings);
        }
        if (scene.threeScene) {
            children.push(SceneGraphNode);
        }
        return children;
    }
    return [];
};

export const SceneNode = {
    dynamic: true,
    name: () => 'Scene',
    numChildren: () => getChildren().length,
    child: (data, idx) => getChildren()[idx],
    childData: (data, idx) => {
        const scene = DebugData.scope.scene;
        const child = getChildren()[idx];
        if (!child)
            return null;
        if (child.type === SceneGraphNode.type) {
            return scene && scene.threeScene;
        } else if (child === VarGame) {
            return VarGameConfig;
        }
        return scene;
    },
    props: () => {
        const scene = DebugData.scope.scene;
        return scene ? [
            {
                id: 'index',
                value: scene.index,
                render: value => <span>#{value}</span>
            }
        ] : [];
    }
};
