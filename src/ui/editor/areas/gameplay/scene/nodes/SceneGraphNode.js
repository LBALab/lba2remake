import React from 'react';

export const SceneGraphNode = {
    type: 'SceneGraphNode',
    dynamic: true,
    needsData: true,
    name: obj => (obj.name ? `${obj.type} "${obj.name}"` : `${obj.type} [${obj.uuid.substr(0, 8)}]`),
    icon: () => 'editor/icons/three.png',
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
                return <img style={{cursor: 'pointer'}} onClick={toggleVisible} src={`editor/icons/${value ? 'visible' : 'hidden'}.png`}/>;
            }
        }
    ],
    onClick: () => {}
};
