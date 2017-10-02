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

const MACROS = {
    map: (args, scope) => {
        const left = execute(args[0], scope);
        const tgt = map(left, (s) => {
            return s !== undefined ? execute(args[1], s) : undefined;
        });
        if (left.__filtered__) {
            tgt.__filtered__ = true;
        }
        return tgt;
    },
    filter: (args, scope) => {
        const left = execute(args[0], scope);
        const tgt = map(left, (s) => {
            const v = execute(args[1], s);
            if (v) {
                return s;
            }
        });
        tgt.__filtered__ = true;
        return tgt;
    }
};

export function execute(node, scope, root = scope) {
    if (node) {
        switch (node.type) {
            case T.IDENTIFIER:
                return scope[node.value];
            case T.INDEX:
                return node.value;
            case T.FUNC_CALL:
                if (scope === root && node.left.type === T.IDENTIFIER) {
                    if (node.left.value in MACROS) {
                        return MACROS[node.left.value](node.args, scope);
                    }
                }
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
                    const left = execute(node.left, scope);
                    return execute(node.right, left, root);
                }
        }
    }
}

export function test() {
    console.log('Running exprDSL tests');

    let count = 0;
    each(TESTS, t => {
        const declinations = [
            t,
            [` ${t[0]}`, t[1]],
            [`${t[0]} `, t[1]],
            [` ${t[0]} `, t[1]]
        ];

        each(declinations, test => {
            if (buildTest(test)())
                count++;
        });
    });

    const label = `Passed ${count}/${TESTS.length * 4} exprDSL test`;
    if (count < TESTS.length * 4)
        console.error(label);
    else
        console.log(label);
}

function buildTest([original, target]) {
    return () => {
        const tgt = target === undefined ? 'undefined': `'${target}'`;
        const label = `generate(parse('${original}')) === ${tgt}`;
        if (generate(parse(original)) === target) {
            console.log(`OK: ${label}`);
            return true;
        } else {
            console.warn(`FAILED: ${label}`);
            return false;
        }
    };
}
