import React from 'react';
import AnimsNode from './AnimsNode';
import BodiesNode from './BodiesNode';
import { getEntities } from './entitities';

let autoexpand = true;

const entityChildren = [
    BodiesNode,
    AnimsNode
];

const EntityNode = {
    dynamic: true,
    name: data => `entity_${data.index}`,
    numChildren: () => 2,
    child: (data, idx) => entityChildren[idx],
    childData: data => data,
    onClick: (data, setRoot, component) => {
        const {setEntity} = component.props.rootStateHandler;
        setEntity(data.index);
        if (autoexpand) {
            setRoot();
        }
    },
    onDoubleClick: (data, component) => {
        const {setEntity} = component.props.rootStateHandler;
        setEntity(data.index);
    },
    props: data => [
        {
            id: 'index',
            value: data.index,
            render: value => `#${value}`
        }
    ],
    selected: (data, component) => {
        if (!component.props.rootState)
            return false;
        const { entity } = component.props.rootState;
        return entity === data.index;
    },
    icon: () => 'editor/icons/entity.png',
};


const labelStyle = {
    fontSize: 12
};

const EntitiesNode = {
    dynamic: true,
    name: () => 'Entities',
    numChildren: () => getEntities().length,
    child: () => EntityNode,
    childData: (data, idx) => getEntities()[idx],
    props: () => [
        {
            id: 'autoexpand',
            value: autoexpand,
            render: (value) => {
                const onChange = (e) => {
                    autoexpand = e.target.checked;
                };
                return <label style={labelStyle} key="autoexpand"><input type="checkbox" checked={value} onChange={onChange}/>Autoexpand</label>;
            }
        },
    ],
    up: (data, collapsed, component) => {
        const {entity} = component.props.rootState;
        const {setEntity} = component.props.rootStateHandler;
        setEntity(Math.max(entity - 1, 0));
    },
    down: (data, collapsed, component) => {
        const {entity} = component.props.rootState;
        const {setEntity} = component.props.rootStateHandler;
        setEntity(Math.min(entity + 1, getEntities().length));
    }
};

export default EntitiesNode;
