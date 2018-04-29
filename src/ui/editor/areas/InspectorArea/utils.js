/* eslint-disable no-underscore-dangle */
import {isFunction, map, noop} from 'lodash';
import * as THREE from 'three';
import DebugData from '../../DebugData';

export const RootSym = '{$}';

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

const vecData = {
    pure: ['getComponent', 'equals', 'min', 'max', 'lengthSq', 'length', 'manhattanLength', 'toArray'],
    kind: {
        getComponent: ['e|g'],
        toArray: ['g|e', 'e|g']
    }
};

const matData = {
    pure: [
        'extractBasis',
        'extractRotation',
        'extractPosition',
        'determinant',
        'getInverse',
        'decompose',
        'equals',
        'toArray',
        'getPosition'
    ],
    kind: {
        toArray: ['g|e', 'e|g']
    }
};

const pureFunctionsByType = [
    {
        type: THREE.Vector2,
        pure: vecData.pure,
        kind: vecData.kind
    },
    {
        type: THREE.Vector3,
        pure: vecData.pure,
        kind: vecData.kind
    },
    {
        type: THREE.Vector4,
        pure: vecData.pure,
        kind: vecData.kind
    },
    {
        type: THREE.Quaternion,
        pure: ['lengthSq', 'length', 'equals', 'toArray'],
        kind: {
            toArray: ['g|e', 'e|g']
        }
    },
    {
        type: THREE.Euler,
        pure: ['equals', 'toArray', 'toVector3'],
        kind: {
            toArray: ['g|e', 'e|g']
        }
    },
    {
        type: THREE.Matrix3,
        pure: matData.pure,
        kind: matData.kind
    },
    {
        type: THREE.Matrix4,
        pure: matData.pure,
        kind: matData.kind
    }
];

export function isPureFunc(obj, key, parent) {
    if (isFunction(obj)) {
        // eslint-disable-next-line no-underscore-dangle
        if (parent && parent.__pure_functions) {
            // eslint-disable-next-line no-underscore-dangle
            return parent.__pure_functions.includes(key);
        }
        for (let i = 0; i < pureFunctionsByType.length; i += 1) {
            const pf = pureFunctionsByType[i];
            if (parent instanceof pf.type) {
                return pf.pure.includes(key);
            }
        }
    }
    return false;
}

export function getAllowedKinds(parent, key, idx) {
    let allowedKinds = ['g', 'e'];
    // eslint-disable-next-line no-underscore-dangle
    if (parent.__param_kind && key in parent.__param_kind) {
        // eslint-disable-next-line no-underscore-dangle
        const paramKinds = parent.__param_kind[key].split(',');
        const kinds = paramKinds[idx];
        allowedKinds = kinds.split('|');
    } else {
        for (let i = 0; i < pureFunctionsByType.length; i += 1) {
            const pf = pureFunctionsByType[i];
            if (parent instanceof pf.type && key in pf.kind) {
                return pf.kind[key][idx].split('|');
            }
        }
    }
    return allowedKinds;
}

export function getParamNames(func) {
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

export function getValue(path, baseScope, bindings) {
    let scope = baseScope;
    for (let i = 0; i < path.length; i += 1) {
        const p = path[i];
        if (scope && p in scope) {
            if (isFunction(scope[p]) && i < path.length - 1) {
                scope = applyFunction(scope[p], scope, path, bindings);
            } else {
                scope = scope[p];
            }
        } else {
            return undefined;
        }
    }
    return scope;
}

export function getParamValues(params, bindings, parent, path) {
    return map(params, (p, idx) => {
        if (!p || !p.value) {
            return undefined;
        }
        if (p.kind === 'g') {
            return getValue(p.value.split('.'), DebugData.scope, bindings);
        } else if (p.kind === 'e') {
            try {
                if (parent && parent.__cb_info && path in parent.__cb_info) {
                    // eslint-disable-next-line no-new-func
                    const args = parent.__cb_info[path][idx].split(',');
                    args.push(`return (${p.value});`);
                    return Function.call(null, ...args);
                }
                // eslint-disable-next-line no-new-func
                return Function(`return (${p.value});`)();
            } catch (e) { /* ignore */ }
        }
        return undefined;
    });
}

function safeCall(fct, parent, pValues) {
    try {
        return pValues ? fct.call(parent, ...pValues) : fct.call(parent);
    } catch (e) {
        return e;
    }
}

export function applyFunction(fct, parent, path, bindings, defaultValue = noop) {
    const params = getParamNames(fct);
    if (params.length === 0) {
        return safeCall(fct, parent);
    }
    if (bindings && path in bindings) {
        const pValues = getParamValues(bindings[path], bindings, parent, path);
        return safeCall(fct, parent, pValues);
    }
    return defaultValue;
}
