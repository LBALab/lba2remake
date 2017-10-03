import T from './types';
import * as MACROS from './macros';
import {map} from 'lodash';

export function execute(node, scope, userMacros, root = scope) {
    if (node) {
        switch (node.type) {
            case T.IDENTIFIER:
                if (node.value in scope) {
                    return scope[node.value];
                } else if (node.value in userMacros) {
                    return execute(userMacros[node.value].program.right, scope, userMacros);
                } else {
                    return undefined;
                }
            case T.INDEX:
                return node.value;
            case T.FUNC_CALL:
                if (scope === root && node.left.type === T.IDENTIFIER) {
                    if (node.left.value in MACROS) {
                        return MACROS[node.left.value](node.args, scope, userMacros);
                    }
                }
                const func = execute(node.left, scope, userMacros);
                const args = map(node.args, arg => execute(arg, scope, userMacros));
                return func.apply(scope, args);
            case T.ARRAY_EXPR:
                const left = execute(node.left, scope, userMacros);
                if (node.right.type === T.IDENTIFIER && node.right.value in userMacros) {
                    return execute(node.right, left, userMacros, root);
                }
                const right = execute(node.right, scope, userMacros);
                return left[right];
            case T.DOT_EXPR:
                if (node.right.type === T.IDENTIFIER) {
                    return execute(node.left, scope, userMacros)[node.right.value];
                } else {
                    const left = execute(node.left, scope);
                    return execute(node.right, left, userMacros, root);
                }
        }
    }
}