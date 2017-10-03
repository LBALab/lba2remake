import {
    map,
    pickBy,
    startsWith,
    isFunction,
    isArray
} from 'lodash';
import {parse, execute} from './exprDSL';
import Types from './exprDSL/types';

const CACHE = {};

export default function autoComplete(cmd, scope) {
    if (cmd in CACHE) {
        return CACHE[cmd];
    } else {
        const baseCmd = cmd;
        if (cmd[cmd.length - 1] === '.' || cmd[cmd.length - 1] === '[') {
            cmd = cmd.substr(0, cmd.length - 1);
        }
        if (!cmd) {
            const values = map(scope, (value, key) => key);
            return CACHE[baseCmd] = {
                html: map(values, (value, label) => `<option>${value}</option>`).join(''),
                color: 'white'
            };
        }
        let ast = cmd.length > 0 ? parse(cmd) : scope;
        if (ast) {
            const tgtScope = safeExecute(ast, [scope]);
            let values;
            if (tgtScope) {
                values = completeScope(cmd, tgtScope);
            } else {
                const [id, tgtScope] = findLastValidScopeAndId(ast, scope);
                const filteredScope = pickBy(tgtScope, (value, key) => startsWith(key, id));
                const idx = cmd.lastIndexOf(id);
                cmd = cmd.substr(0, idx);
                cmd.substr(0, idx);
                if (cmd[cmd.length - 1] === '.' || cmd[cmd.length - 1] === '[') {
                    cmd = cmd.substr(0, cmd.length - 1);
                }
                values = completeScope(cmd, filteredScope);
            }
            return CACHE[baseCmd] = {
                html: map(values, (value, label) => `<option>${value}</option>`).join(''),
                color: 'white'
            };
        } else {
            return CACHE[baseCmd] = {
                html: '',
                color: 'lightcoral'
            };
        }
    }
}

function completeScope(cmd, scope) {
    if (isFunction(scope)) {
        if (scope.length === 0) {
            return [`${cmd}()`];
        } else {
            return [`${cmd}(`];
        }
    } else if (isArray(scope)) {
        return map(scope, (value, key) => `${cmd}[${key}]`);
    } else {
        if (cmd) {
            return map(scope, (value, key) => `${cmd}.${key}`);
        }
        else {
            return map(scope, (value, key) => key);
        }
    }
}

function findLastValidScopeAndId(ast, scope) {
    if (ast.type === Types.IDENTIFIER) {
        return [ast.value, scope];
    } else if (ast.right) {
        return findLastValidScopeAndId(ast.right, safeExecute(ast.left, [scope]) || {});
    } else {
        return [ast, {}];
    }
}

function safeExecute(ast, scopes) {
    try {
        return execute(ast, scopes);
    } catch (e) {}
}