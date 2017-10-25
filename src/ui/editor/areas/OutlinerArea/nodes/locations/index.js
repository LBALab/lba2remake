import React from 'react';
import {
    find,
    findIndex,
    concat,
    map,
    drop,
    take
} from 'lodash';
import {Twinsun} from './twinsun';
import {Moon} from './moon';
import {ZeelishSurface} from './zeelish_surface';
import {ZeelishUndergas} from './zeelish_undergas';
import {editor as editorStyle} from '../../../../../styles';
import DebugData from '../../../../DebugData';

export const LocationsNode = {
    name: 'Locations',
    children: [
        Twinsun,
        Moon,
        ZeelishSurface,
        ZeelishUndergas
    ]
};

export function LocatorMenu(props) {
    const locate = (type) => {
        const scene = DebugData.scope.scene;
        if (scene) {
            const path = findScenePath(LocationsNode, scene.index);
            if (path && path.length > 1) {
                const mPath = drop(path);
                const index = findIndex(mPath, node => node.type === type);
                if (index !== -1) {
                    const tPath = take(mPath, index + 1);
                    props.stateHandler.setPath(map(tPath, n => n.name));
                }
            }
        }
    };
    return <span>
        Locate:&nbsp;
        <button style={editorStyle.button} onClick={locate.bind(null, 'planet')}>Planet</button>
        <button style={editorStyle.button} onClick={locate.bind(null, 'island')}>Island</button>
        <button style={editorStyle.button} onClick={locate.bind(null, 'section')}>Section</button>
        <button style={editorStyle.button} onClick={locate.bind(null, 'building')}>Building</button>
    </span>
}

function findScenePath(node, index, path = []) {
    if (node.props) {
        const indexProp = find(node.props, p => p.id === 'index');
        if (indexProp && indexProp.value === index) {
            return concat(path, node);
        }
    }
    for (let i = 0; i < node.children.length; ++i) {
        const foundPath = findScenePath(node.children[i], index, concat(path, node));
        if (foundPath) {
            return foundPath;
        }
    }
}
