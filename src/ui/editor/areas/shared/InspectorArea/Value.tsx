import * as React from 'react';
import {flatMap, isArray, isEmpty, map, slice, take, times} from 'lodash';
import * as THREE from 'three';
import DebugData, {getObjectName} from '../../../DebugData';

export class CustomValue {
    renderElem: React.ReactElement;

    constructor(renderElem) {
        this.renderElem = renderElem;
    }

    render() {
        return this.renderElem;
    }
}

const selectStyle = {
    userSelect: 'text' as const,
    cursor: 'text' as const
};

export function Value({value}) {
    if (value === undefined) {
        return <span style={{color: 'darkgrey', fontStyle: 'italic'}}>undefined</span>;
    }
    if (value === null) {
        return <span style={{color: 'darkgrey', fontStyle: 'italic'}}>null</span>;
    }
    if (value instanceof CustomValue) {
        return value.render();
    }
    if (value instanceof Error) {
        return <span style={{color: 'red', fontStyle: 'italic'}}>Error: {value.message}</span>;
    }
    if (typeof (value) === 'string') {
        return <span style={{color: 'orange'}}>
            &apos;<span style={selectStyle}>{value}</span>&apos;
        </span>;
    }
    if (typeof (value) === 'boolean') {
        return <span style={{color: value ? 'lime' : 'red', fontStyle: 'italic'}}>
            {value ? 'true' : 'false'}
        </span>;
    }
    if (typeof (value) === 'number') {
        const num = Number.isInteger(value) ? value : value.toFixed(3);
        return <span style={{color: 'yellow'}}>{num}</span>;
    }
    if (isArray(value)) {
        return <span style={{color: 'white'}}>[{value.length}]</span>;
    }
    if (value instanceof Object) {
        if (value instanceof THREE.Vector2
            || value instanceof THREE.Vector3
            || value instanceof THREE.Vector4) {
            return <Vector vec={value}/>;
        }
        if (value instanceof THREE.Quaternion) {
            return <Quat quat={value}/>;
        }
        if (value instanceof THREE.Euler) {
            return <Euler euler={value}/>;
        }
        if (value instanceof THREE.Matrix3) {
            return <Matrix mat={value} n={3}/>;
        }
        if (value instanceof THREE.Matrix4) {
            return <Matrix mat={value} n={4}/>;
        }
        if (value.type) {
            let name = null;
            if (DebugData.scope.scene && (value.type === 'actor' || value.type === 'zone')) {
                const mName = getObjectName(value.type, DebugData.scope.scene.index, value.index);
                if (mName) {
                    name = <React.Fragment>
                        :<span style={{color: 'orange'}}>&apos;{mName}&apos;</span>
                    </React.Fragment>;
                }
            } else if (value.name) {
                name = <React.Fragment>
                    :<span style={{color: 'orange'}}>&apos;{value.name}&apos;</span>
                </React.Fragment>;
            }
            return <span style={{color: '#b238ff'}}>
                {value.type}{name}<span style={{color: 'white'}}>{'{}'}</span>
            </span>;
        }
        if (isEmpty(value)) {
            return <span style={{color: 'grey'}}>{'{}'}</span>;
        }
        return <span style={{color: 'white'}}>{'{}'}</span>;
    }
    return <span style={{color: 'grey'}}>{value}</span>;
}

function intersperse(arr, inter) {
    return flatMap(arr, (a, i) => (i ? [inter, a] : [a]));
}

const ARRAY_COLOR = ['#ff9089', '#8bff8f', '#92e0ff', '#fbffb2'];

const wrapStyleVec = {
    display: 'inline-block' as const,
    fontSize: 13,
    fontWeight: 'bold' as const,
    verticalAlign: 'middle' as const,
    padding: '0 4px',
    marginLeft: 6,
    borderLeft: '2px solid white',
    borderRight: '2px solid white'
};

function Vector({vec}) {
    const mapComp = (n, i) => <span key={i} style={{color: ARRAY_COLOR[i]}}>
        {Number.isInteger(n) ? n : n.toFixed(3)}
    </span>;
    const va = vec.toArray();
    const components = intersperse(map(va, mapComp), ' ');
    return <span style={{color: 'white'}}>Vec{va.length}
        <span style={wrapStyleVec}>{components}</span>
    </span>;
}

function Quat({quat}) {
    const mapComp = (n, i) => <span key={i} style={{color: ARRAY_COLOR[i]}}>
        {Number.isInteger(n) ? n : n.toFixed(3)}
    </span>;
    const components = intersperse(map(quat.toArray(), mapComp), ' ');
    return <span style={{color: 'white'}}>Quat
        <span style={wrapStyleVec}>{components}</span>
    </span>;
}

function Euler({euler}) {
    const mapComp = (n, i) => <span key={i} style={{color: ARRAY_COLOR[i]}}>
        {Number.isInteger(n) ? n : n.toFixed(3)}
    </span>;
    const components = intersperse(map(take(euler.toArray(), 3), mapComp), ' ');
    const order = <span style={{color: 'orange'}}>&apos;{euler.order}&apos;</span>;
    return <span style={{color: 'white'}}>Euler
        <span style={wrapStyleVec}>{components} {order}</span>
    </span>;
}

const wrapStyleMat = {
    display: 'inline-block' as const,
    fontSize: 11,
    fontWeight: 'bold' as const,
    verticalAlign: 'top' as const,
    padding: 0,
    marginLeft: 6,
    borderLeft: '2px solid white',
    borderRight: '2px solid white'
};

const dispNum = (num, fixed = 3) => {
    if (Math.abs(num) < 0.005) {
        num = 0;
    } else if (Math.abs(num - Math.round(num)) < 0.005) {
        num = Math.round(num);
    }
    return Number.isInteger(num)
        ? num
        : num.toFixed(fixed);
};

function Matrix({mat, n}) {
    const mapComp = (num, i) =>
        <div key={i}>
            {dispNum(num, 2)}
        </div>;
    const columns = times(n, (r) => {
        const components = map(slice(mat.elements, r * n, (r * n) + n), mapComp);
        const style = {
            color: ARRAY_COLOR[r],
            display: 'inline-block',
            padding: '0 4px'
        };
        return <div key={r} style={style}>
            {components}
        </div>;
    });
    return <span style={{color: 'white'}}>
        Mat{n}
        <span style={wrapStyleMat}>
            {columns}
        </span>
    </span>;
}
