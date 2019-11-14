import * as React from 'react';
import {size, sortBy, map, each, filter} from 'lodash';
import DebugData from '../../../DebugData';
import {ActorsNode} from './nodes/ActorsNode';
import {ZonesNode} from './nodes/ZonesNode';
import {PointsNode} from './nodes/PointsNode';
import {makeVarDef, makeVariables, Var} from './node_factories/variables';
import LocationsNode from '../locator/LocationsNode';

const VarCube = makeVariables('varcube', 'Scene Variables', (scene) => {
    if (scene) {
        return scene.variables;
    }
    return [];
}, (scene) => {
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

const VarGame = {
    dynamic: true,
    name: () => 'Game Variables',
    icon: () => 'editor/icons/var.svg',
    numChildren: (scene) => {
        const {game} = DebugData.scope;
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
    childData: (scene, idx) => {
        const {game} = DebugData.scope;
        if (scene && game) {
            const state = game.getState();
            if (VarGameConfig.filterScene) {
                const usedVarGames = VarGameConfig.filterInventory
                    ? filter(scene.usedVarGames, vg => vg < 40)
                    : scene.usedVarGames;
                const varGame = usedVarGames[idx];
                if (varGame !== undefined) {
                    return makeVarDef(null, 'vargame', varGame, () => state.flags.quest, () => null);
                }
            } else {
                return makeVarDef(null, 'vargame', idx, () => state.flags.quest, () => null);
            }
        }
        return null;
    },
    childProps: [
        {
            id: 'filter_scene',
            name: 'Only in scene',
            value: () => VarGameConfig.filterScene,
            render: (value) => {
                const onChange = (e) => {
                    VarGameConfig.filterScene = e.target.checked;
                };
                return <input type="checkbox" checked={value} onChange={onChange}/>;
            },
            icon: () => 'editor/icons/settings.svg',
            color: '#AAAAAA'
        },
        {
            id: 'filter_inventory',
            name: 'Only inventory',
            value: () => VarGameConfig.filterInventory,
            render: (value) => {
                const onChange = (e) => {
                    VarGameConfig.filterInventory = e.target.checked;
                };
                return <input type="checkbox" checked={value} onChange={onChange}/>;
            },
            icon: () => 'editor/icons/settings.svg',
            color: '#AAAAAA'
        }
    ]
};

const baseChildren = [
    ActorsNode,
    ZonesNode,
    PointsNode,
    VarCube,
    VarGame
];

const SubScene = {
    dynamic: true,
    name: scene => `Scene ${scene.index}`,
    icon: () => 'editor/icons/areas/scene.png',
    iconStyle: {
        width: 16,
        height: 16
    },
    numChildren: () => {
        const scene = DebugData.scope.scene;
        return scene ? baseChildren.length : 0;
    },
    child: (scene, idx) => baseChildren[idx],
    childData: scene => scene
};

const Siblings = {
    dynamic: true,
    name: () => 'Siblings',
    icon: () => 'editor/icons/areas/scene.png',
    iconStyle: {
        width: 16,
        height: 16
    },
    numChildren: scene => size(scene.sideScenes),
    child: () => SubScene,
    childData: (scene, idx) => sortBy(scene.sideScenes)[idx]
};

const getChildren = () => {
    const scene = DebugData.scope.scene;
    if (scene) {
        const children = map(baseChildren);
        const data = findSceneData(scene.index);
        children.unshift({
            name: data.name,
            icon: data.icon,
            props: data.props,
            children: [],
            lineStyle: {
                marginLeft: 0
            },
            nameStyle: {
                marginLeft: 10
            },
            style: {
                height: '30px',
                lineHeight: '30px',
                background: '#1F1F1F',
                margin: 0,
                padding: 4,
                overflow: 'hidden'
            },
            onClick: () => {}
        });
        if (scene.sideScenes) {
            children.push(Siblings);
        }
        return children;
    }
    return [];
};

const SceneNode = {
    dynamic: true,
    name: () => {
        const scene = DebugData.scope.scene;
        return scene ? `Scene_${scene.index}` : '<N/A>';
    },
    icon: () => 'editor/icons/areas/scene.png',
    iconStyle: {
        width: 16,
        height: 16
    },
    numChildren: () => getChildren().length,
    child: (data, idx) => getChildren()[idx],
    childData: () => DebugData.scope.scene,
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

export function findSceneData(sceneIndex, node = LocationsNode) {
    if (node.props && node.props[0] && node.props[0].value === sceneIndex) {
        return node;
    }
    if (node.children) {
        for (let i = 0; i < node.children.length; i += 1) {
            const childNode = findSceneData(sceneIndex, node.children[i]);
            if (childNode) {
                return childNode;
            }
        }
    }
    return null;
}

export default SceneNode;
