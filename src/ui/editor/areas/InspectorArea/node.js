import React from 'react';
import {isFunction} from 'lodash';
import DebugData from '../../DebugData';
import {Value} from './value';

const obj = (data, root) => data || (root && root()) || [];
const objOrEA = (data, root) => obj(data, root) || [];
const keys = (data, root) => Object.keys(objOrEA(data, root));

const hash = (data, root) => {
    const ks = keys(data, root);
    let value;
    if (ks.length === 0) {
        value = data || (root && root());
    } else {
        value = ks.join(',');
    }
    const id = Math.round(new Date().getTime() * 0.01);
    return `${value};${id}`;
};

export const InspectorNode = (name, addWatch, root = () => DebugData.scope) => ({
    dynamic: true,
    icon: () => 'none',
    name: () => name,
    numChildren: (data) => {
        if (typeof (obj(data, root)) === 'string')
            return 0;
        return keys(data, root).length;
    },
    child: (data, idx) => InspectorNode(keys(data, root)[idx], addWatch, null),
    childData: (data, idx) => {
        const k = keys(data, root)[idx];
        return objOrEA(data, root)[k];
    },
    color: (data) => {
        const value = obj(data, root);
        if (isFunction(value)) {
            return '#5cffa9';
        }
        return '#49d2ff';
    },
    hasChanged: () => true,
    props: (data, expanded) => [{
        id: 'value',
        style: {paddingLeft: isFunction(obj(data, root)) ? 0 : 10},
        value: hash(data, root),
        render: () => (expanded || keys(data, root).length === 0) && <span style={{color: '#FFFFFF'}}>
            <Value value={root ? root() : data}/>
        </span>
    }, {
        id: 'watch',
        value: null,
        render: (dt, component) => {
            if (!root && addWatch && component.props.level !== 0) {
                const onClick = () => {
                    addWatch(component.props.path);
                };
                return <span style={{fontSize: 12, cursor: 'pointer', float: 'right'}} onClick={onClick}>watch</span>;
            }
            return null;
        }
    }],
    ctxMenu: !root && addWatch && [
        {
            name: 'Watch',
            onClick: (component) => {
                addWatch(component.props.path);
            }
        },
    ],
});
