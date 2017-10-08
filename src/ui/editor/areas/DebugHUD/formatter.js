import {
    map,
    each,
    isFunction,
    isArray,
    times,
    constant,
    take,
    slice
} from 'lodash';
import THREE from 'three';

export function mapValue(expr, value, root = true) {
    if (value === undefined || value === null)
        return `<span style="color:darkgrey;font-style:italic;">${value}</span>`;
    if (typeof(value) === 'string')
        return `<span style="color:orange;">"${value}"</span>`;
    if (isFunction(value))
        return `function(${times(value.length, constant('_')).join(', ')})`;
    if (isArray(value) && !root)
        return `[${value.length}]`;
    if (value instanceof Object) {
        if (value instanceof THREE.Vector2
            || value instanceof THREE.Vector3
            || value instanceof THREE.Vector4) {
            return mapVector(value);
        } else if (value instanceof THREE.Quaternion) {
            return mapQuat(value);
        } else if (value instanceof THREE.Euler) {
            return mapEuler(value);
        } else if (value instanceof THREE.Matrix3) {
            return mapMat(value, 3, root);
        } else if (value instanceof THREE.Matrix4) {
            return mapMat(value, 4, root);
        } else if (root) {
            const marker = isArray(value) ? '[]' : '{}';
            const type = !isArray(value) && value.type ? `${value.type} ` : '';
            let subValues;
            if (isArray(value)) {
                subValues = mapArray(expr, value);
            } else {
                subValues = map(value, (v, key) =>
                    `&nbsp;&nbsp;<span class="link" title="${expr}.${key}" style="cursor:pointer;">`
                    + `<span style="color:mediumpurple;">${key}</span>`
                    + `: ${mapValue(expr, v, false)}</span>`
                );
            }
            return`${type}${marker[0]}<br/>${subValues.join(',<br/>')}<br/>${marker[1]}`;
        } else if (value.type) {
            return `${value.type} {...}`;
        } else {
            return '{...}';
        }
    }
    if (typeof(value) === 'boolean')
        return `<span style="color:${value ? 'lime' : 'red'};font-style:italic;">${value}</span>`;
    if (typeof(value) === 'number' && !Number.isInteger(value)) {
        return value.toFixed(3);
    }
    return value;
}

function mapArray(expr, array) {
    let tgt;
    const filtered = array.__filtered__;
    const sorted = array.__sorted__;
    const arrayEntry = (value, key) =>
        `&nbsp;&nbsp;<span class="link" title="${expr}[${key}]" style="cursor:pointer;">`
        + `[<span style="color:mediumpurple;">${key}</span>]`
        + `: ${mapValue(expr, value, false)}</span>`;
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

function mapVector(vec) {
    const mapComp = (n, i) => `<span style="color:${ARRAY_COLOR[i]};">${n.toFixed(3)}</span>`;
    const va = vec.toArray();
    const components = map(va, mapComp);
    return `Vec${va.length}(${components.join(', ')})`;
}

function mapQuat(quat) {
    const mapComp = (n, i) => `<span style="color:${ARRAY_COLOR[i]};">${n.toFixed(3)}</span>`;
    const components = map(quat.toArray(), mapComp);
    return `Quat(${components.join(', ')})`;
}

function mapEuler(euler) {
    const mapComp = (n, i) => `<span style="color:${ARRAY_COLOR[i]};">${n.toFixed(3)}</span>`;
    const components = map(take(euler.toArray(), 3), mapComp);
    const order = `<span style="color:orange;">"${euler.order}"</span>`;
    return `Euler(${components.join(', ')}, ${order})`;
}

function mapMat(mat, n, root) {
    if (root) {
        const mapComp = (n, i) => `<span style="color:${ARRAY_COLOR[i]};">${n.toFixed(3)}</span>`;
        const rows = times(n, r => {
            const components = map(slice(mat.elements, r * n, r * n + n), mapComp);
            return `&nbsp;&nbsp;${components.join(', ')}`;
        });
        return `Mat${n}[<br/>${rows.join('<br/>')}<br/>]`;
    } else {
        return `Mat${n}[...]`;
    }
}
