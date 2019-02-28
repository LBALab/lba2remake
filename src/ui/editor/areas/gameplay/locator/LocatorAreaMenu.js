import React from 'react';
import {
    findIndex,
    map,
    drop,
    take
} from 'lodash';
import {editor as editorStyle} from '../../../../styles';
import DebugData from '../../../DebugData';
import findScenePath from './findScenePath';
import LocationsNode from './LocationsNode';

export default function LocatorAreaMenu(props) {
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
    return <span style={{display: 'inline-block', paddingTop: 4}}>
        <button style={editorStyle.button} onClick={locate.bind(null, 'all')}>All</button>
        <button style={editorStyle.button} onClick={locate.bind(null, 'planet')}>Planet</button>
        <button style={editorStyle.button} onClick={locate.bind(null, 'island')}>Island</button>
        <button style={editorStyle.button} onClick={locate.bind(null, 'section')}>Section</button>
        <button style={editorStyle.button} onClick={locate.bind(null, 'building')}>Building</button>
    </span>;
}
