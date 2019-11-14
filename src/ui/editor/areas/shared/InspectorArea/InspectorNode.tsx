/* eslint-disable no-underscore-dangle */
import * as React from 'react';
import * as THREE from 'three';
import {map, filter, concat, isFunction, isEmpty, uniq} from 'lodash';
import DebugData from '../../../DebugData';
import {CustomValue, Value} from './Value';
import {RootSym, applyFunction, isPureFunc} from './utils';
import {getParamNames} from '../../../../../utils';

const getObj = (data, root) => {
    if (root)
        return root();
    return data;
};

const getKeysBase = obj => ((Object.getPrototypeOf(obj))
    ? concat(Object.keys(obj), getKeys(Object.getPrototypeOf(obj)))
    : Object.keys(obj));

const getKeys = obj => uniq(filter(getKeysBase(obj || []), k => k.substr(0, 2) !== '__'));

const hash = (data, root) => {
    const obj = getObj(data, root);
    const keys = getKeys(obj);
    const value = keys.join(',');
    const id = Math.round(new Date().getTime() * 0.01);
    return `${value};${id}`;
};

const isThree = obj =>
    obj instanceof THREE.Matrix3
    || obj instanceof THREE.Matrix4
    || obj instanceof THREE.Vector2
    || obj instanceof THREE.Vector3
    || obj instanceof THREE.Vector4
    || obj instanceof THREE.Quaternion
    || obj instanceof THREE.Euler;

const isSimpleValue = obj =>
    obj === null
    || isEmpty(obj)
    || typeof (obj) === 'string'
    || typeof (obj) === 'number'
    || typeof (obj) === 'boolean';

const getRoot = () => DebugData.scope;

function applyFctFromComponent(obj, parent, component) {
    const path = (component.props.path || []).join('.');
    const userData = component.props.userData;
    return applyFunction(obj, parent, path, userData && userData.bindings);
}

const prefixByKind = {
    g: `${RootSym}.`
};

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
    title: (data) => {
        const obj = getObj(data, root);
        if (obj && obj.__location)
            return obj.__location;
        return undefined;
    },
    numChildren: (data, ignored, component) => {
        let obj = getObj(data, root);
        if (isPureFunc(obj, name, parent)) {
            obj = applyFctFromComponent(obj, parent, component);
        }
        if (typeof (obj) === 'string' || obj instanceof CustomValue)
            return 0;
        return getKeys(obj).length;
    },
    child: (data, idx, component) => {
        let obj = getObj(data, root);
        if (isPureFunc(obj, name, parent)) {
            obj = applyFctFromComponent(obj, parent, component);
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
        if (obj === undefined || obj === null) {
            return obj;
        }
        if (isPureFunc(obj, name, parent)) {
            obj = applyFctFromComponent(obj, parent, component);
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
                let paramNames: any[] = getParamNames(obj);
                if (isPure) {
                    const userData = component.props.userData;
                    const bPath = (component.props.path || []).join('.');
                    if (userData && userData.bindings && bPath in userData.bindings) {
                        const bindings = userData.bindings[bPath];
                        paramNames = map(bindings, (p, idx) =>
                            <span key={idx} style={{color: 'white'}}>
                                {prefixByKind[p.kind]}{p.value}
                            </span>
                        );
                    }
                }
                const editStyle = {
                    padding: '0 6px',
                    margin: '0 3px',
                    color: isPure ? 'white' : 'grey',
                    fontSize: 11,
                    fontWeight: 'bold' as const,
                    border: isPure ? '1px inset #5cffa9' : '1px inset #3d955d',
                    borderRadius: 4,
                    background: 'rgba(0, 0, 0, 0.5)',
                    cursor: 'pointer' as const
                };
                const paramStyle = {
                    color: isPure ? '#BBBBBB' : '#666666'
                };
                const onClick = () =>
                    editBindings(concat(path, name).slice(1), parent, component.props.userData);
                const style = {
                    color: isPure ? '#5cffa9' : '#3d955d',
                    wordBreak: 'break-word' as const
                };
                return <span style={style}>
                    (
                    {map(paramNames, (param, idx) =>
                        <React.Fragment key={idx}>
                            {idx > 0 ? ', ' : null}
                            <span style={paramStyle}>{param}</span>
                        </React.Fragment>)}
                    )
                    {!(isPure && paramNames.length === 0) &&
                        <span style={editStyle} onClick={onClick}>EDIT</span>}
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
                    const nObj = applyFctFromComponent(obj, parent, component);
                    if (obj === nObj) {
                        return null;
                    }
                    obj = nObj;
                } else {
                    return null;
                }
            }
            if (collapsed || isSimpleValue(obj) || isThree(obj) || obj instanceof CustomValue) {
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
