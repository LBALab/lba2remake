import {map, each} from 'lodash';
import {parseProgram} from './parse';
import T from './types';
import TESTS from './tests';

export {execute} from './execute';

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
    return null;
}

export function test() {
    // eslint-disable-next-line no-console
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

    each(TESTS, (unitTest) => {
        each(declinations, (decl) => {
            if (buildTest(decl(unitTest))())
                count += 1;
        });
    });

    const duration = ((new Date().getTime() - start) * 0.001).toFixed(3);

    const label = `Passed ${count}/${TESTS.length * declinations.length} exprDSL test in ${duration} seconds`;
    if (count < TESTS.length * declinations.length) // eslint-disable-next-line no-console
        console.error(label);
    else // eslint-disable-next-line no-console
        console.log(label);
}

function buildTest([original, target]) {
    return () => {
        const tgt = target === undefined ? 'undefined' : `'${target}'`;
        const label = `generate(parse('${original}')) === ${tgt}`;
        if (generate(parse(original)) === target) {
            // eslint-disable-next-line no-console
            console.log(`OK: ${label}`);
            return true;
        }
        // eslint-disable-next-line no-console
        console.warn(`FAILED: ${label}`);
        return false;
    };
}
