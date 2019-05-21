import React from 'react';
import DebugData from '../../../DebugData';

export const SceneGraphNode = {
    type: 'SceneGraphNode',
    dynamic: true,
    needsData: true,
    style: {
        height: 20,
        fontSize: 16,
        lineHeight: '20px'
    },
    key: obj => obj.uuid,
    name: obj => obj.name || obj.uuid.substr(0, 8),
    icon: (obj) => {
        switch (obj.type) {
            case 'Mesh':
                return 'editor/icons/mesh.svg';
            case 'LineSegments':
                return 'editor/icons/lines.svg';
            case 'PerspectiveCamera':
                return 'editor/icons/camera.svg';
        }
        return 'editor/icons/three.svg';
    },
    numChildren: obj => obj.children.length,
    child: () => SceneGraphNode,
    childData: (obj, idx) => obj.children[idx],
    props: obj => [
        {
            id: 'visible',
            value: obj.visible,
            render: (value) => {
                const toggleVisible = () => {
                    obj.visible = !obj.visible;
                };
                const style = {
                    cursor: 'pointer',
                    width: 14,
                    height: 14
                };
                return <img style={style} onClick={toggleVisible} src={`editor/icons/${value ? 'visible' : 'hidden'}.svg`}/>;
            }
        },
        {
            id: 'type',
            value: obj.type,
            render: value => <span style={{color: '#037acc'}}>{value}</span>
        }
    ]
};

export const SceneGraphRootNode = {
    dynamic: true,
    name: () => {
        const scene = DebugData.scope.scene;
        if (scene) {
            return `scene_${scene.index}`;
        }
        return 'none';
    },
    icon: () => 'editor/icons/areas/graph.png',
    iconStyle: {
        width: 16,
        height: 16
    },
    numChildren: () => {
        const scene = DebugData.scope.scene;
        if (scene && scene.threeScene) {
            return 1;
        }
        return 0;
    },
    child: () => SceneGraphNode,
    childData: () => {
        const scene = DebugData.scope.scene;
        return scene && scene.threeScene;
    }
};
