import React from 'react';
import * as THREE from 'three';
import {
    map,
    each,
    isFunction,
    isArray,
    isEmpty,
    times,
    constant,
    take,
    slice
} from 'lodash';
import {intersperse, intersperseBR} from './utils';

export default function Expression({expr, value, addExpression}) {
    if (value && 'value' in value) {
        return <span key={expr.expr}>
            {expr.expr} = <Value expr={expr} value={value.value} addExpression={addExpression} />
        </span>;
    } else if (value && 'error' in value) {
        return <span key={expr.expr}>
            {expr.expr} = <span style={{color: 'red'}}>Error: {value.error.toString()}</span>
        </span>;
    }
    return <span key={expr.expr}> {expr.expr} = N/A</span>;
}

function Value({expr, value, root = true, addExpression}) {
    if (value === undefined) {
        return <span style={{color: 'darkgrey', fontStyle: 'italic'}}>undefined</span>;
    }
    if (value === null) {
        return <span style={{color: 'darkgrey', fontStyle: 'italic'}}>null</span>;
    }
    if (typeof (value) === 'string') {
        return <span style={{color: 'orange'}}>'{value}'</span>;
    }
    if (typeof (value) === 'boolean') {
        return <span style={{color: value ? 'lime' : 'red', fontStyle: 'italic'}}>{value ? 'true' : 'false'}</span>;
    }
    if (typeof (value) === 'number' && !Number.isInteger(value)) {
        return <span>{value.toFixed(3)}</span>;
    }
    if (isFunction(value)) {
        return <span>function({times(value.length, constant('_')).join(', ')})</span>;
    }
    if (isArray(value) && !root) {
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
        } else if (root) {
            const marker = isArray(value) ? '[]' : '{}';
            const type = !isArray(value) && value.type ? `${value.type} ` : '';
            if (isEmpty(value)) {
                return <span>{type}{marker[0]}{marker[1]}</span>;
            }
            let subValues;
            if (isArray(value)) {
                subValues = mapArray(expr, value, addExpression);
            } else {
                subValues = map(value, (v, key) =>
                    <span key={key} style={{cursor: 'pointer'}} onClick={addExpression.bind(null, `${expr.expr}.${key}`)}>
                        &nbsp;
                        &nbsp;
                        <span style={{cursor: 'pointer'}}>
                            <span style={{color: 'mediumpurple'}}>{key}</span>
                            : <Value expr={expr} value={v} root={false}/>
                        </span>
                    </span>
                );
            }
            return <span>{type}{marker[0]}<br/>{intersperseBR(subValues)}<br/>{marker[1]}</span>;
        } else if (value.type) {
            return <span>{value.type} {'{...}'}</span>;
        }
        if (isEmpty(value)) {
            return <span>{'{}'}</span>;
        }
        return <span>{'{...}'}</span>;
    }
    return <span>{value}</span>;
}

function mapArray(expr, array, addExpression) {
    let tgt;
    const filtered = array.__filtered__;
    const sorted = array.__sorted__;
    const arrayEntry = (value, key) =>
        <span key={key} style={{cursor: 'pointer'}} onClick={addExpression.bind(null, `${expr.expr}[${key}]`)}>
            &nbsp;
            &nbsp;
            <span title="${expr}[${key}]">
                [<span style={{color: 'mediumpurple'}}>{key}</span>]
            </span>
            : <Value expr={expr} value={value} root={false} />
        </span>;

    if (filtered || sorted) {
        tgt = [];
        each(array, (value, key) => {
            if (sorted) {
                key = value.idx;
                value = value.value;
            }
            if (value !== undefined) {
                tgt.push(arrayEntry(value, key));
            }
        });
    } else {
        tgt = map(array, arrayEntry);
    }
    return tgt;
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
    const order = <span style={{color: 'orange'}}>"{euler.order}"</span>;
    return <span>Euler({components}, {order})</span>;
}

function Matrix({mat, n, root}) {
    if (root) {
        const mapComp = (num, i) =>
            <span key={i} style={{color: ARRAY_COLOR[i]}}>{num.toFixed(3)}</span>;
        const rows = times(n, (r) => {
            const components = map(slice(mat.elements, r * n, r * n + n), mapComp);
            return <span key={r} >
                &nbsp;
                &nbsp;
                {intersperse(components, ', ')}</span>;
        });
        return <span>Mat{n}[<br/>{intersperseBR(rows)}<br/>]</span>;
    }
    return <span>Mat{n}[...]</span>;
}
