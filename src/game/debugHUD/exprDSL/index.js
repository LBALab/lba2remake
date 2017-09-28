import {parseExpression} from './parse';
import T from './types';
import {map} from 'lodash';

export function parse(expr) {
    const res = parseExpression(expr);
    return res && res.node;
}

export function generate(node) {
    if (node) {
        switch (node.type) {
            case T.IDENTIFIER:
            case T.INDEX:
                return node.value;
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
