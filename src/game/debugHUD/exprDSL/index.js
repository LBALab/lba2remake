import {parseProgram} from './parse';
import T from './types';
import TESTS from './tests';
import {map, each} from 'lodash';

export function parse(expr) {
    const res = parseProgram(expr);
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
            case T.ASSIGNMENT:
                return `${generate(node.left)}=${generate(node.right)}`;
        }
    }
}

const MACROS = {
    map: (args, scope, userMacros) => {
        const left = execute(args[0], scope, userMacros);
        const tgt = map(left, (s) => {
            return s !== undefined ? execute(args[1], s, userMacros) : undefined;
        });
        if (left.__filtered__) {
            tgt.__filtered__ = true;
        }
        return tgt;
    },
    filter: (args, scope, userMacros) => {
        const left = execute(args[0], scope, userMacros);
        const tgt = map(left, (s) => {
            const v = execute(args[1], s, userMacros);
            if (v) {
                return s;
            }
        });
        tgt.__filtered__ = true;
        return tgt;
    }
};

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

export function test() {
    console.log('Running exprDSL tests');

    let count = 0;

    const declinations = [
        t => t,
        t => [` ${t[0]}`, t[1]],
        t => [`${t[0]} `, t[1]],
        t => [` ${t[0]} `, t[1]],
        t => [`x=${t[0]}`, t[1] !== undefined ? `x=${t[1]}` : undefined],
        t => [`sjska556fj_ = ${t[0]}`, t[1] !== undefined ? `sjska556fj_=${t[1]}` : undefined],
        t => [` AA = ${t[0]} `, t[1] !== undefined ? `AA=${t[1]}` : undefined]
    ];

    const start = new Date().getTime();

    each(TESTS, test => {
        each(declinations, decl => {
            if (buildTest(decl(test))())
                count++;
        });
    });

    const duration = ((new Date().getTime() - start) * 0.001).toFixed(3);

    const label = `Passed ${count}/${TESTS.length * declinations.length} exprDSL test in ${duration} seconds`;
    if (count < TESTS.length * declinations.length)
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
