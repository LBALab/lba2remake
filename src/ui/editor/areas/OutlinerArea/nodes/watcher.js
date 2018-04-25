import React from 'react';
import DebugData from '../../../DebugData';
import {Value} from '../../DebugHUDArea/Expression';

const obj = (data, root) => data || (root && root()) || [];
const keys = (data, root) => Object.keys(obj(data, root));

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

export const WatcherNode = (name, root = () => DebugData.scope) => ({
    dynamic: true,
    icon: () => 'none',
    name: () => name,
    numChildren: data => keys(data, root).length,
    child: (data, idx) => WatcherNode(keys(data, root)[idx], null),
    childData: (data, idx) => {
        const k = keys(data, root)[idx];
        return obj(data, root)[k];
    },
    color: '#49d2ff',
    props: (data, expanded) => [{
        id: 'value',
        value: hash(data, root),
        render: () => (expanded || keys(data, root).length === 0) && <span style={{color: '#FFFFFF'}}>
            {Value({
                expr: name,
                value: root ? root() : data,
                root: false,
                addExpression: () => {
                }
            })}
        </span>
    }]
});
