import {parseExpression} from './parse';
import T from './types';
import TESTS from './tests';
import {map, each} from 'lodash';

export function parse(expr) {
    const res = parseExpression(expr);
    return res && res.node;
}

export function generate(node) {
    if (node) {
        switch (node.type) {
            case T.IDENTIFIER:
            case T.INDEX:
                return node.value.toString();
            case T.FUNC_CALL:
                const args = map(node.args, generate);
                return `${generate(node.left)}(${args.join(',')})`;
            case T.ARRAY_EXPR:
                return `${generate(node.left)}[${generate(node.right)}]`;
            case T.DOT_EXPR:
                return `${generate(node.left)}.${generate(node.right)}`;
        }
    }
}

export function execute(node, scope) {
    if (node) {
        switch (node.type) {
            case T.IDENTIFIER:
                return scope[node.value];
            case T.INDEX:
                return node.value;
            case T.FUNC_CALL:
                const func = execute(node.left, scope);
                const args = map(node.args, arg => execute(arg, scope));
                return func.apply(scope, args);
            case T.ARRAY_EXPR:
                const left = execute(node.left, scope);
                const right = execute(node.right, scope);
                return left[right];
            case T.DOT_EXPR:
                if (node.right.type === T.IDENTIFIER) {
                    return execute(node.left, scope)[node.right.value];
                } else {
                    return execute(node.left, scope)[execute(node.right, scope)];
                }
        }
    }
}

export function test() {
    console.log('Running exprDSL tests');

    let count = 0;
    each(TESTS, test => {
        if (test())
            count++;
    });

    const label = `Passed ${count}/${TESTS.length} exprDSL test`;
    if (count < TESTS.length)
        console.error(label);
    else
        console.log(label);
}


