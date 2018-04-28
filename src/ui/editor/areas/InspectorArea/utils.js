import {map, noop} from 'lodash';
import DebugData from '../../DebugData';

export const RootSym = '{$}';

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

export function getParamNames(func) {
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

export function getValue(path, baseScope) {
    let scope = baseScope;
    for (let i = 0; i < path.length; i += 1) {
        const p = path[i];
        if (scope && p in scope) {
            scope = scope[p];
        } else {
            return undefined;
        }
    }
    return scope;
}

export function getParamValues(params) {
    return map(params, ({value, kind}) => {
        if (kind === 'g') {
            return getValue(value.split('.'), DebugData.scope);
        } else if (kind === 'e') {
            try {
                // eslint-disable-next-line no-new-func
                return Function(`return (${value});`)();
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
        const pValues = getParamValues(bindings[path]);
        return safeCall(fct, parent, pValues);
    }
    return defaultValue;
}
