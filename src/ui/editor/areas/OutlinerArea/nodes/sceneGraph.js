import React from 'react';

/**
 * @return {null}
 */
export function SceneGraphNode(threeNode, idx) {
    if (!threeNode)
        return null;

    return {
        name: `THREE.${threeNode.type}${idx ? '[' + (threeNode.name ? threeNode.name : idx) + ']' : ''}`,
        dynamic: true,
        getNumChildren: () => {
            return threeNode ? threeNode.children.length : 0;
        },
        childNeedsUpdate: (idx, value) => {
            return value.type !== threeNode.children[idx].type
                || value.name !== threeNode.children[idx].name;
        },
        getChild: (idx) => {
            return SceneGraphNode(threeNode.children[idx], idx);
        },
        props: [
            {id: 'visible', value: threeNode.visible}
        ],
        renderProp: (id, value) => {
            if (id === 'visible') {
                return <img src={`editor/icons/${value ? 'visible' : 'hidden'}.png`}/>;
            }
        }
    }
}