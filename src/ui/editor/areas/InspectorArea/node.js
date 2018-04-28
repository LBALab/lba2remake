import React from 'react';
import * as THREE from 'three';
import {map, filter, concat, isFunction, isEmpty} from 'lodash';
import DebugData from '../../DebugData';
import {Value} from './value';
import {getParamNames, getParamValues} from './utils';
import {RootSym} from './content';

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

function safeCall(fct, parent, pValues) {
    try {
        return pValues ? fct.call(parent, ...pValues) : fct.call(parent);
    } catch (e) {
        return e;
    }
}

function applyFct(obj, parent, component) {
    const params = getParamNames(obj);
    if (params.length === 0) {
        return safeCall(obj, parent);
    }
    const userData = component.props.userData;
    const path = (component.props.path || []).join('.');
    if (userData && userData.bindings && path in userData.bindings) {
        const pValues = getParamValues(userData.bindings[path]);
        return safeCall(obj, parent, pValues);
    }
    return obj;
}

export const InspectorNode = (
    name,
    addWatch,
    editBindings,
    root = getRoot,
    parent = null,
    path = []
) => ({
    dynamic: true,
    icon: () => 'none',
    name: () => name,
    numChildren: (data, ignored, component) => {
        let obj = getObj(data, root);
        if (isFunction(obj)) {
            if (isPureFunc(obj, name, parent)) {
                obj = applyFct(obj, parent, component);
            } else {
                return 0;
            }
        }
        if (typeof (obj) === 'string')
            return 0;
        return getKeys(obj).length;
    },
    child: (data, idx, component) => {
        let obj = getObj(data, root);
        if (isPureFunc(obj, name, parent)) {
            obj = applyFct(obj, parent, component);
        }
        return InspectorNode(
            getKeys(obj)[idx],
            addWatch,
            editBindings,
            null,
            obj,
            concat(path, name)
        );
    },
    childData: (data, idx, component) => {
        let obj = getObj(data, root);
        if (isPureFunc(obj, name, parent)) {
            obj = applyFct(obj, parent, component);
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
        render: (value, component) => {
            const obj = getObj(data, root);
            if (isFunction(obj)) {
                const isPure = isPureFunc(obj, name, parent);
                let paramNames = getParamNames(obj);
                if (isPure) {
                    const userData = component.props.userData;
                    const bPath = (component.props.path || []).join('.');
                    if (userData && userData.bindings && bPath in userData.bindings) {
                        const bindings = userData.bindings[bPath];
                        paramNames = map(paramNames, (p, idx) =>
                            <span style={{color: 'white'}}>{RootSym}.{bindings[idx]}</span>
                        );
                    }
                }
                const editStyle = {
                    display: 'inline-block',
                    padding: '0 6px',
                    margin: '0 3px',
                    verticalAlign: 'center',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 'bold',
                    border: '1px inset #5cffa9',
                    borderRadius: 4,
                    background: 'rgba(0, 0, 0, 0.5)',
                    cursor: 'pointer'
                };
                const paramStyle = {
                    color: isPure ? '#BBBBBB' : '#666666'
                };
                const onClick = () => editBindings(concat(path, name).slice(1), parent);
                return <span style={{color: isPure ? '#5cffa9' : '#3d955d'}}>
                    (
                    {map(paramNames, (param, idx) =>
                        <React.Fragment key={idx}>
                            {idx > 0 ? ', ' : null}
                            <span style={paramStyle}>{param}</span>
                        </React.Fragment>)}
                    )
                    {isPure && paramNames.length > 0 &&
                        <div style={editStyle} onClick={onClick}>EDIT</div>}
                </span>;
            }
            return null;
        }
    }, {
        id: 'value',
        value: hash(data, root),
        render: (value, component) => {
            let obj = getObj(data, root);
            if (isFunction(obj)) {
                if (isPureFunc(obj, name, parent)) {
                    const nObj = applyFct(obj, parent, component);
                    if (obj === nObj) {
                        return null;
                    }
                    obj = nObj;
                } else {
                    return null;
                }
            }
            if (collapsed || isSimpleValue(obj) || isMatrix(obj)) {
                return <Value value={obj}/>;
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
