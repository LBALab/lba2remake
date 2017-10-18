import React from 'react';

export const SceneGraphNode = {
    dynamic: true,
    needsData: true,
    name: (obj) => `THREE.${obj.type}[${obj.name ? obj.name : obj.uuid.substr(0, 8)}]`,
    numChildren: (obj) => obj.children.length,
    child: () => SceneGraphNode,
    childData: (obj, idx) => obj.children[idx],
    props: (obj) => [
        {
            id: 'visible',
            value: obj.visible,
            render: (value) => <img src={`editor/icons/${value ? 'visible' : 'hidden'}.png`}/>
        }
    ],
    onClick: () => {}
};
