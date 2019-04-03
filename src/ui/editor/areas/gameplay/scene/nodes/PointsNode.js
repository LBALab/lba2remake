import React from 'react';
import DebugData, {getObjectName, renameObject, locateObject} from '../../../../DebugData';
import {SceneGraphNode} from '../../sceneGraph/SceneGraphNode';
import {makeObjectsNode} from '../node_factories/objects';

const Point = {
    dynamic: true,
    needsData: true,
    allowRenaming: () => true,
    rename: (point, newName) => {
        renameObject('point', point.props.sceneIndex, point.index, newName);
    },
    ctxMenu: [
        {
            name: 'Locate',
            onClick: (component, point) => locateObject(point)
        }
    ],
    name: point => getObjectName('point', point.props.sceneIndex, point.index),
    icon: () => 'editor/icons/point2.svg',
    numChildren: point => (point.threeObject ? 1 : 0),
    child: () => SceneGraphNode,
    childData: point => point.threeObject,
    selected: (point) => {
        const selection = DebugData.selection;
        return selection && selection.type === 'point' && selection.index === point.index;
    },
    onClick: (point) => { DebugData.selection = {type: 'point', index: point.index}; },
    onDoubleClick: (point) => {
        locateObject(point);
    }
};

export const PointsNode = makeObjectsNode('point', {
    dynamic: true,
    needsData: true,
    name: () => 'Points',
    icon: () => 'editor/icons/point.svg',
    numChildren: scene => scene.points.length,
    child: () => Point,
    childData: (scene, idx) => scene.points[idx],
    hasChanged: scene => scene.index !== DebugData.scope.scene.index,
    props: (data, ignored, component) => {
        const label = component.props.rootState.labels.point;
        return [{
            id: 'visible',
            value: label,
            render: (visible) => {
                const style = {
                    width: 14,
                    height: 14,
                    cursor: 'pointer'
                };
                const onClick = () => {
                    component.props.rootStateHandler.setLabel('point', !label);
                };
                return <img
                    style={style}
                    src={`editor/icons/${visible ? 'visible' : 'hidden'}.svg`}
                    onClick={onClick}
                />;
            }
        }];
    }
});
