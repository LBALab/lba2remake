import T from './types';
import * as MACROS from './macros';
import {map, concat} from 'lodash';

export function execute(node, scopes, userMacros) {
    if (node) {
        switch (node.type) {
            case T.IDENTIFIER:
                const idx = findScope(node.value, scopes);
                if (idx !== -1) {
                    return scopes[idx][node.value];
                } else if (node.value in userMacros) {
                    return execute(userMacros[node.value].program.right, scopes, userMacros);
                } else {
                    return undefined;
                }
            case T.INDEX:
                return node.value;
            case T.FUNC_CALL:
                const func = execute(node.left, scopes, userMacros);
                if (!func && node.left.type === T.IDENTIFIER && node.left.value in MACROS) {
                    return MACROS[node.left.value](node.args, scopes, userMacros);
                }
                const args = map(node.args, arg => execute(arg, scopes, userMacros));
                return func.apply(null, args);
            case T.ARRAY_EXPR:
                const left = execute(node.left, scopes, userMacros);
                if (node.right.type === T.IDENTIFIER && node.right.value in userMacros) {
                    return execute(node.right, concat(scopes, left), userMacros);
                }
                const right = execute(node.right, scopes, userMacros);
                return left[right];
            case T.DOT_EXPR:
                if (node.right.type === T.IDENTIFIER) {
                    return execute(node.left, scopes, userMacros)[node.right.value];
                } else {
                    const left = execute(node.left, scopes, userMacros);
                    return execute(node.right, concat(scopes, left), userMacros);
                }
        }
    }
}

function findScope(key, scopes) {
    for (let i = scopes.length - 1; i >= 0; --i) {
        if (key in scopes[i]) {
            return i;
        }
    }
    return -1;
}
