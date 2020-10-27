import * as React from 'react';
import DebugData, {getObjectName, renameObject, locateObject} from '../../../../DebugData';
import {SceneGraphNode} from '../../sceneGraph/SceneGraphNode';
import {makeObjectsNode} from '../node_factories/objects';
import Scene from '../../../../../../game/Scene';
import Zone, { ZONE_TYPE } from '../../../../../../game/Zone';

const ZoneNode = {
    dynamic: true,
    needsData: true,
    allowRenaming: () => true,
    rename: (zone: Zone, newName) => {
        renameObject('zone', zone.props.sceneIndex, zone.props.index, newName);
    },
    ctxMenu: [
        {
            name: 'Locate',
            onClick: (_component, zone: Zone) => locateObject(zone)
        }
    ],
    name: zone => getObjectName('zone', zone.props.sceneIndex, zone.props.index),
    icon: zone => `editor/icons/zones/${ZONE_TYPE[zone.props.type]}.svg`,
    props: zone => [
        {
            id: 'index',
            value: zone.props.index,
            render: value => <span>#{value}</span>
        },
        {
            id: 'visible',
            value: zone.threeObject.visible,
            render: (value) => {
                const onClick = () => {
                    zone.threeObject.visible = !zone.threeObject.visible;
                    if (zone.threeObject.visible) {
                        zone.threeObject.updateMatrix();
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
    childProps: [
        {
            id: 'type',
            name: 'Type',
            value: (zone: Zone) => zone,
            render: (zone: Zone) => {
                const {r, g, b} = zone.color;
                // tslint:disable-next-line:max-line-length
                const color = `rgba(${Math.floor(r * 256)},${Math.floor(g * 256)},${Math.floor(b * 256)},1)`;
                return <span style={{color}}>{ZONE_TYPE[zone.props.type]}</span>;
            }
        },
        {
            id: 'param',
            name: 'Param',
            value: (zone: Zone) => {
                let value = zone.props.snap;
                if (ZONE_TYPE[zone.props.type] === 'TEXT') {
                    if (DebugData.scope.scene.props.texts[value]) {
                        value = DebugData.scope.scene.props.texts[value].value;
                    }
                }
                return value;
            }
        },
    ],
    numChildren: (zone: Zone) => (zone.threeObject ? 1 : 0),
    child: () => SceneGraphNode,
    childData: (zone: Zone) => zone.threeObject,
    selected: (zone: Zone) => {
        const selection = DebugData.selection;
        return selection && selection.type === 'zone' && selection.index === zone.props.index;
    },
    onClick: (zone: Zone) => { DebugData.selection = {type: 'zone', index: zone.props.index}; },
    onDoubleClick: (zone: Zone) => {
        locateObject(zone);
    }
};

export const ZonesNode = makeObjectsNode('zone', {
    dynamic: true,
    needsData: true,
    name: () => 'Zones',
    icon: () => 'editor/icons/zone.svg',
    numChildren: (scene: Scene) => scene.zones.length,
    child: () => ZoneNode,
    childData: (scene: Scene, idx) => scene.zones[idx],
    hasChanged: (scene: Scene) => scene.index !== DebugData.scope.scene.index,
    props: (_data, _ignored, component) => {
        const label = component.props.rootState.labels.zone;
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
                    component.props.rootStateHandler.setLabel('zone', !label);
                };
                return <img
                    style={style}
                    src={`editor/icons/${visible ? 'visible' : 'hidden'}_zones.svg`}
                    onClick={onClick}
                />;
            }
        }];
    }
});
