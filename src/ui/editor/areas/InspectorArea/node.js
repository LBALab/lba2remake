import React from 'react';
import * as THREE from 'three';
import {map, filter, isFunction, isEmpty} from 'lodash';
import DebugData from '../../DebugData';
import {Value} from './value';

const getObj = (data, root) => {
    if (root)
        return root();
    return data;
};

const getKeys = obj => filter(Object.keys(obj || []), k => k.substr(0, 2) !== '__');

const isPureFunc = (obj, key, parent) => {
    if (isFunction(obj)) {
        // eslint-disable-next-line no-underscore-dangle
        const pure = parent.__pure_functions || [];
        return pure.includes(key);
    }
    return false;
};

const hash = (data, root) => {
    const obj = getObj(data, root);
    const keys = getKeys(obj);
    const value = keys.join(',');
    const id = Math.round(new Date().getTime() * 0.01);
    return `${value};${id}`;
};

const isMatrix = obj => obj instanceof THREE.Matrix3 || obj instanceof THREE.Matrix4;

const isSimpleValue = obj =>
    obj === null
    || isEmpty(obj)
    || typeof (obj) === 'string'
    || typeof (obj) === 'number'
    || typeof (obj) === 'boolean';

const getRoot = () => DebugData.scope;

export const InspectorNode = (name, addWatch, root = getRoot, parent) => ({
    dynamic: true,
    icon: () => 'none',
    name: () => name,
    numChildren: (data) => {
        let obj = getObj(data, root);
        if (isFunction(obj)) {
            if (isPureFunc(obj, name, parent)) {
                const params = getParamNames(obj);
                if (params.length === 0) {
                    obj = obj();
                }
            } else {
                return 0;
            }
        }
        if (typeof (obj) === 'string')
            return 0;
        return getKeys(obj).length;
    },
    child: (data, idx) => {
        let obj = getObj(data, root);
        if (isFunction(obj)) {
            if (isPureFunc(obj, name, parent)) {
                const params = getParamNames(obj);
                if (params.length === 0) {
                    obj = obj();
                }
            }
        }
        return InspectorNode(getKeys(obj)[idx], addWatch, null, obj);
    },
    childData: (data, idx) => {
        let obj = getObj(data, root);
        if (isFunction(obj)) {
            if (isPureFunc(obj, name, parent)) {
                const params = getParamNames(obj);
                if (params.length === 0) {
                    obj = obj();
                }
            }
        }
        const k = getKeys(obj)[idx];
        return obj[k];
    },
    color: (data) => {
        const obj = getObj(data, root);
        if (isFunction(obj)) {
            if (isPureFunc(obj, name, parent)) {
                return '#5cffa9';
            }
            return '#3d955d';
        }
        return '#49d2ff';
    },
    hasChanged: () => true,
    props: (data, collapsed) => [{
        id: 'params',
        style: {paddingLeft: 0},
        value: hash(data, root),
        render: () => {
            const obj = getObj(data, root);
            if (isFunction(obj)) {
                const isPure = isPureFunc(obj, name, parent);
                return <span style={{color: isPure ? '#5cffa9' : '#3d955d'}}>
                    (
                    {map(getParamNames(obj), (param, idx) => <React.Fragment key={idx}>
                        {idx > 0 ? ', ' : null}
                        {isPure
                            ? <span style={{color: '#BBBBBB', cursor: 'pointer'}}>{param}</span>
                            : <span style={{color: '#666666'}}>{param}</span>}
                    </React.Fragment>)}
                    )
                </span>;
            }
            return null;
        }
    }, {
        id: 'value',
        value: hash(data, root),
        render: () => {
            let obj = getObj(data, root);
            if (isFunction(obj)) {
                if (isPureFunc(obj, name, parent)) {
                    const params = getParamNames(obj);
                    if (params.length === 0) {
                        obj = obj();
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            }
            if (collapsed || isSimpleValue(obj) || isMatrix(obj)) {
                return <Value value={obj}/>;
            }
            return null;
        }
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

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}
