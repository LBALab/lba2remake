import * as React from 'react';
import DebugData, {locateObject} from '../../../../DebugData';
import {SceneGraphNode} from '../../../shared/SceneGraphArea/SceneGraphNode';
import {makeObjectsNode} from '../node_factories/objects';

const Point = {
    dynamic: true,
    needsData: true,
    allowRenaming: () => true,
    ctxMenu: [
        {
            name: 'Locate',
            onClick: (_component, point) => locateObject(point)
        }
    ],
    name: point => point.props.index,
    icon: () => 'editor/icons/point2.svg',
    numChildren: point => (point.threeObject ? 1 : 0),
    child: () => SceneGraphNode,
    childData: point => point.threeObject,
    selected: (point) => {
        const selection = DebugData.selection;
        return selection && selection.type === 'point' && selection.index === point.props.index;
    },
    onClick: (point) => { DebugData.selection = {type: 'point', index: point.props.index}; },
    onDoubleClick: (point) => {
        locateObject(point);
    },
    props: point => [
        {
            id: 'visible',
            value: point.threeObject.visible,
            render: (value) => {
                const onClick = () => {
                    point.threeObject.visible = !point.threeObject.visible;
                    if (point.threeObject.visible) {
                        point.threeObject.updateMatrix();
                    }
                };
                return <img
                    src={`editor/icons/${value ? 'visible' : 'hidden'}.svg`}
                    onClick={onClick}
                    style={{cursor: 'pointer', width: 14, height: 14}}
                />;
            }
        }
    ],
};

export const PointsNode = makeObjectsNode('point', {
    dynamic: true,
    needsData: true,
    name: () => 'Points',
    icon: () => 'editor/icons/point.svg',
    ctxMenu: [
        {
            name: 'Add new point',
            onClick: (component) => {
                component.props.rootStateHandler.setAddingObject('point');
            }
        }
    ],
    numChildren: scene => scene.points.length,
    child: () => Point,
    childData: (scene, idx) => scene.points[idx],
    hasChanged: scene => scene.index !== DebugData.scope.scene.index,
    props: (_data, _ignored, component) => {
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
                    src={`editor/icons/${visible ? 'visible' : 'hidden'}_points.svg`}
                    onClick={onClick}
                />;
            }
        }];
    }
});
