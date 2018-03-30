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
    type: 'all',
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
            if (path) {
                const index = findIndex(path, node => node.type === type);
                if (index !== -1) {
                    const activePath = map(drop(path), node => node.name);
                    const tgtPath = take(activePath, index);
                    props.stateHandler.setPath(tgtPath);
                    props.stateHandler.setActivePath(activePath);
                }
            }
        }
    };
    return <span>
        <button style={editorStyle.button} onClick={locate.bind(null, 'all')}>All</button>
        <button style={editorStyle.button} onClick={locate.bind(null, 'planet')}>Planet</button>
        <button style={editorStyle.button} onClick={locate.bind(null, 'island')}>Island</button>
        <button style={editorStyle.button} onClick={locate.bind(null, 'section')}>Section</button>
        <button style={editorStyle.button} onClick={locate.bind(null, 'building')}>Building</button>
    </span>;
}

export function findScenePath(node, index, path = []) {
    if (node.props) {
        const indexProp = find(node.props, p => p.id === 'index');
        if (indexProp && indexProp.value === index) {
            return concat(path, node);
        }
    }
    for (let i = 0; i < node.children.length; i += 1) {
        const foundPath = findScenePath(node.children[i], index, concat(path, node));
        if (foundPath) {
            return foundPath;
        }
    }
    return null;
}
