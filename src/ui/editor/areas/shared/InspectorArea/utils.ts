/* eslint-disable no-underscore-dangle */
import {isFunction, map, filter, noop, concat} from 'lodash';
import * as THREE from 'three';
import DebugData, {getObjectName} from '../../../DebugData';
import {getParamNames} from '../../../../../utils';

const allowedNameTypes = ['actor', 'zone', 'point'];

export const UtilFunctions = {
    map: (collection, iteratee) => map(collection, iteratee),

    filter: (collection, predicate) => filter(collection, predicate),

    name: (obj) => {
        if (!obj) {
            throw new Error('Need to provide an object');
        }
        if (obj.name) {
            throw obj.name;
        }
        if (!obj.type || !allowedNameTypes.includes(obj.type)) {
            throw new Error(`Invalid object type: ${obj.type}`);
        }
        if (!DebugData.scope.scene) {
            throw new Error('Need to have a scene loaded');
        }
        if (!Number.isInteger(obj.index) || obj.index < 0) {
            throw new Error(`Invalid object index: ${obj.index}`);
        }
        return getObjectName(obj.type, DebugData.scope.scene.index, obj.index);
    },

    expression: expr => expr,
    __param_kind: {
        map: 'g|e,e',
        filter: 'g|e,e',
        expression: 'e'
    },
    __cb_info: {
        map: ['', 'item,idx,collection'],
        filter: ['', 'item,idx,collection'],
    }
};

const makePure = (fct) => {
    fct.__pure_function = true;
};

makePure(UtilFunctions.map);
makePure(UtilFunctions.filter);
makePure(UtilFunctions.name);
makePure(UtilFunctions.expression);

export const RootSym = 'this';

const vecData = {
    pure: [
        'lengthSq',
        'length',
        'manhattanLength',
    ],
    kind: {
        getComponent: ['e|g'],
        toArray: ['g|e', 'e|g']
    }
};

const matData = {
    pure: [
        'determinant',
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
        pure: ['lengthSq', 'length'],
        kind: {
            toArray: ['g|e', 'e|g']
        }
    },
    {
        type: THREE.Euler,
        pure: [],
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
        if ((obj as any).__pure_function === true) {
            return true;
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

function getParamFunc(p, idx, bindings, parent, path) {
    try {
        let doCall = true;
        let args = ['THREE', 'map', 'filter', 'name'];
        if (parent && parent.__cb_info
            && path in parent.__cb_info
            && parent.__cb_info[path][idx]) {
            // eslint-disable-next-line no-new-func
            args = concat(args, parent.__cb_info[path][idx].split(','));
            doCall = false;
        }
        args.push(`return (${p.value});`);
        const scope = DebugData.scope;
        const expr =
            Function.call(null, ...args).bind(scope, THREE, map, filter, UtilFunctions.name);
        return doCall ? expr() : expr;
    } catch (e) {
        /* ignore */
    }
    return undefined;
}

function getParamValue(p, idx, bindings, parent, path) {
    if (!p || !p.value) {
        return undefined;
    }
    if (p.kind === 'g') {
        return getValue(p.value.split('.'), DebugData.scope, bindings);
    }
    if (p.kind === 'e') {
        return getParamFunc(p, idx, bindings, parent, path);
    }
    return undefined;
}

export function getParamValues(params, bindings, parent, path) {
    return map(params, (p, idx) => getParamValue(p, idx, bindings, parent, path));
}

function safeCall(fct, parent, pValues = null) {
    try {
        return pValues ? fct.call(parent, ...pValues) : fct.call(parent);
    } catch (e) {
        return e;
    }
}

export function applyFunction(fct, parent, path, bindings, defaultValue: any | Error = noop) {
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
