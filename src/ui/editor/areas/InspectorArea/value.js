/* eslint-disable no-underscore-dangle */
import React from 'react';
import {flatMap, isArray, isEmpty, isFunction, map, each, slice, take, times} from 'lodash';
import * as THREE from 'three';
import DebugData from '../../DebugData';

class ArgWrapper {
    constructor(fct, index) {
        this.__fct = fct;
        this.__value = '';
        this.__index = index;
    }

    setValue(value) {
        this.__value = value;
        this.__fct.tryCall();
    }

    __getValue() {
        if (this.__getType() === 'path') {
            return this.__value;
        }
        let scope = DebugData.scope;
        const path = this.__value.split('.');
        for (let i = 0; i < path.length; i += 1) {
            if (path[i] in scope) {
                scope = scope[path[i]];
            } else {
                return undefined;
            }
        }
        return scope;
    }

    __getType() {
        const fct = this.__fct.__func;
        return fct.__argTypes && fct.__argTypes[this.__index];
    }
}

export class FuncResult {
    constructor(fct, thisValue) {
        const params = getParamNames(fct);
        if (params.length > 0) {
            this.__params = [];
            each(params, (p, idx) => {
                const arg = new ArgWrapper(this, idx);
                this[`[arg:${p}]`] = arg;
                this.__params[idx] = arg;
            });
        }
        this.__func = fct;
        this.__this = thisValue;
        this.tryCall();
    }

    tryCall() {
        try {
            this['[call!]'] = this.__func.apply(this.__this, map(this.__params, p => p.__getValue()));
        } catch (e) {
            this['[call!]'] = e;
        }
    }
}

export function Value({value}) {
    if (value === undefined) {
        return <span style={{color: 'darkgrey', fontStyle: 'italic'}}>undefined</span>;
    }
    if (value === null) {
        return <span style={{color: 'darkgrey', fontStyle: 'italic'}}>null</span>;
    }
    if (value instanceof Error) {
        return <span style={{color: 'red', fontStyle: 'italic'}}>Error: {value.message}</span>;
    }
    if (value instanceof ArgWrapper) {
        const style = {
            background: value.__getValue() ? '#ffffff' : '#ffa5a1'
        };
        const onKeyDown = (e) => {
            e.stopPropagation();
        };
        const onChange = (e) => {
            value.setValue(e.target.value);
        };
        const onRef = (ref) => {
            if (ref) {
                ref.value = value.__value;
            }
        };
        const type = value.__getType();
        return <span>
            {type ? `(${type})` : 'DBG.'}
            <input ref={onRef} type="text" style={style} onKeyDown={onKeyDown} onChange={onChange}/>
        </span>;
    }
    if (value instanceof FuncResult) {
        return <span style={{color: '#5cffa9'}}>(
            <span style={{color: 'grey'}}>
                {getParamNames(value.__func).join(', ')}
            </span>)
        </span>;
    }
    if (isFunction(value)) {
        return <span style={{color: '#5cffa9'}}>(<span style={{color: 'grey'}}>{getParamNames(value).join(', ')}</span>)</span>;
    }
    if (typeof (value) === 'string') {
        return <span style={{color: 'orange'}}>&apos;{value}&apos;</span>;
    }
    if (typeof (value) === 'boolean') {
        return <span style={{color: value ? 'lime' : 'red', fontStyle: 'italic'}}>{value ? 'true' : 'false'}</span>;
    }
    if (typeof (value) === 'number' && !Number.isInteger(value)) {
        return <span>{value.toFixed(3)}</span>;
    }
    if (isArray(value)) {
        return <span>[{value.length}]</span>;
    }
    if (value instanceof Object) {
        if (value instanceof THREE.Vector2
            || value instanceof THREE.Vector3
            || value instanceof THREE.Vector4) {
            return <Vector vec={value}/>;
        } else if (value instanceof THREE.Quaternion) {
            return <Quat quat={value}/>;
        } else if (value instanceof THREE.Euler) {
            return <Euler euler={value}/>;
        } else if (value instanceof THREE.Matrix3) {
            return <Matrix mat={value} n={3} root={root}/>;
        } else if (value instanceof THREE.Matrix4) {
            return <Matrix mat={value} n={4} root={root}/>;
        } else if (value.type) {
            return <span style={{color: '#b238ff'}}>{value.type}</span>;
        }
        if (isEmpty(value)) {
            return <span>{'{}'}</span>;
        }
        return <span>{'{}'}</span>;
    }
    return <span>{value}</span>;
}

function intersperse(arr, inter) {
    return flatMap(arr, (a, i) => (i ? [inter, a] : [a]));
}

function intersperseBR(arr) {
    return flatMap(arr, (a, i) => (i ? [<br key={`br${i}`}/>, a] : [a]));
}

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

const ARRAY_COLOR = ['red', 'lime', 'lightskyblue', 'yellow'];

function Vector({vec}) {
    const mapComp = (n, i) => <span key={i} style={{color: ARRAY_COLOR[i]}}>{n.toFixed(3)}</span>;
    const va = vec.toArray();
    const components = intersperse(map(va, mapComp), ', ');
    return <span>Vec{va.length}({components})</span>;
}

function Quat({quat}) {
    const mapComp = (n, i) => <span key={i} style={{color: ARRAY_COLOR[i]}}>{n.toFixed(3)}</span>;
    const components = intersperse(map(quat.toArray(), mapComp), ', ');
    return <span>Quat({components})</span>;
}

function Euler({euler}) {
    const mapComp = (n, i) => <span key={i} style={{color: ARRAY_COLOR[i]}}>{n.toFixed(3)}</span>;
    const components = intersperse(map(take(euler.toArray(), 3), mapComp), ', ');
    const order = <span style={{color: 'orange'}}>&quot;{euler.order}&quot;</span>;
    return <span>Euler({components}, {order})</span>;
}

function Matrix({mat, n, root}) {
    if (root) {
        const mapComp = (num, i) =>
            <span key={i} style={{color: ARRAY_COLOR[i]}}>{num.toFixed(3)}</span>;
        const rows = times(n, (r) => {
            const components = map(slice(mat.elements, r * n, (r * n) + n), mapComp);
            return <span key={r} >
                &nbsp;
                &nbsp;
                &nbsp;
                {intersperse(components, ', ')}</span>;
        });
        return <span>Mat{n}[<br/>{intersperseBR(rows)}<br/>&nbsp;&nbsp;]</span>;
    }
    return <span>Mat{n}[...]</span>;
}
