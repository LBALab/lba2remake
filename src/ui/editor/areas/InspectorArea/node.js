/* eslint-disable no-underscore-dangle */
import React from 'react';
import {isFunction, filter, extend, map} from 'lodash';
import DebugData from '../../DebugData';
import {Value, FuncResult} from './value';

const obj = (data, root) => data || (root && root()) || [];
const objOrEA = (data, root) => obj(data, root) || [];
const keys = (data, root) => filter(Object.keys(objOrEA(data, root)), k => k.substr(0, 2) !== '__');

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

function mapUtil(array, path) {
    const actualPath = path || undefined;
    return map(array, actualPath);
}
mapUtil.__argTypes = [null, 'path'];

const isFuncLike = value => isFunction(value) || value instanceof FuncResult;
const getRoot = () => extend({
    map: mapUtil,
    __pure_functions: ['map']
}, DebugData.scope);

export const InspectorNode = (name, addWatch, root = getRoot) => ({
    dynamic: true,
    icon: () => 'none',
    name: () => name,
    numChildren: (data) => {
        const o = obj(data, root);
        if (typeof (o) === 'string')
            return 0;
        return keys(data, root).length;
    },
    child: (data, idx) => InspectorNode(keys(data, root)[idx], addWatch, null),
    childData: (data, idx, component) => {
        const sS = component.props.sharedState;
        const watchID = sS && sS.watchID;
        const k = keys(data, root)[idx];
        const o = objOrEA(data, root)[k];
        const pure = (data && data.__pure_functions) || (root && root().__pure_functions) || [];
        if (isFunction(o) && pure.includes(k)) {
            if (watchID) {
                if (!o.__func_result_watches) {
                    o.__func_result_watches = {};
                }
                if (!o.__func_result_watches[watchID]) {
                    o.__func_result_watches[watchID] = new FuncResult(o, data);
                } else {
                    o.__func_result_watches[watchID].tryCall();
                }
                return o.__func_result_watches[watchID];
            } else {
                if (!o.__func_result) {
                    o.__func_result = new FuncResult(o, data);
                } else {
                    o.__func_result.tryCall();
                }
                return o.__func_result;
            }
        }
        return o;
    },
    color: (data) => {
        const value = obj(data, root);
        if (isFuncLike(value)) {
            return '#5cffa9';
        }
        return '#49d2ff';
    },
    hasChanged: () => true,
    props: (data, collapsed) => [{
        id: 'value',
        style: {paddingLeft: isFuncLike(obj(data, root)) ? 0 : 10},
        value: hash(data, root),
        render: () => (collapsed || keys(data, root).length === 0 || isFuncLike(obj(data, root))) && <span style={{color: '#FFFFFF'}}>
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
