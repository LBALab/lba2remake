import {
    map,
    pickBy,
    startsWith,
    isFunction,
    isArray
} from 'lodash';
import {parse, execute} from './index';
import Types from './types';

const CACHE = {};

export default function autoComplete(cmd, scope) {
    if (cmd.match(/^ *$/)) {
        return map(scope, (value, key) => key);
    }
    if (cmd in CACHE) {
        return CACHE[cmd];
    }
    const baseCmd = cmd;
    if (cmd[cmd.length - 1] === '.' || cmd[cmd.length - 1] === '[') {
        cmd = cmd.substr(0, cmd.length - 1);
    }
    if (!cmd) {
        const values = map(scope, (value, key) => key);
        return CACHE[baseCmd] = values;
    }
    const ast = cmd.length > 0 ? parse(cmd) : scope;
    if (ast) {
        const tgtScope = safeExecute(ast, [scope]);
        let values;
        if (tgtScope) {
            values = completeScope(cmd, tgtScope);
        } else {
            const [id, innerTgtScope] = findLastValidScopeAndId(ast, scope);
            const filteredScope = pickBy(innerTgtScope, (value, key) => startsWith(key, id));
            const idx = cmd.lastIndexOf(id);
            cmd = cmd.substr(0, idx);
            cmd.substr(0, idx);
            if (cmd[cmd.length - 1] === '.' || cmd[cmd.length - 1] === '[') {
                cmd = cmd.substr(0, cmd.length - 1);
            }
            values = completeScope(cmd, filteredScope);
        }
        return CACHE[baseCmd] = values;
    }
    return CACHE[baseCmd] = [];
}

function completeScope(cmd, scope) {
    if (isFunction(scope)) {
        if (scope.length === 0) {
            return [`${cmd}()`];
        }
        return [`${cmd}(`];
    } else if (isArray(scope)) {
        return map(scope, (value, key) => `${cmd}[${key}]`);
    }
    if (cmd) {
        return map(scope, (value, key) => `${cmd}.${key}`);
    }

    return map(scope, (value, key) => key);
}

function findLastValidScopeAndId(ast, scope) {
    if (ast.type === Types.IDENTIFIER) {
        return [ast.value, scope];
    } else if (ast.right) {
        return findLastValidScopeAndId(ast.right, safeExecute(ast.left, [scope]) || {});
    }
    return [ast, {}];
}

function safeExecute(ast, scopes) {
    try {
        return execute(ast, scopes);
    } catch (e) {}
    return null;
}
