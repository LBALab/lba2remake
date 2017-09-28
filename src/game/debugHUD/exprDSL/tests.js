const tests = [
    buildTest('0', '0'),
    buildTest(' 0', '0'),
    buildTest('0 ', '0'),
    buildTest(' 0 ', '0'),
    buildTest('  0  ', '0'),

    buildTest('x', 'x'),
    buildTest(' x', 'x'),
    buildTest('x ', 'x'),
    buildTest(' x ', 'x'),
    buildTest('  x  ', 'x'),

    buildTest('abc123', 'abc123'),
    buildTest('  abc123 ', 'abc123'),
    buildTest('ABC', 'ABC'),
    buildTest('abc_', 'abc_'),
    buildTest('ab_c', 'ab_c'),
    buildTest('_abc', '_abc'),
    buildTest('1abc', undefined),
    buildTest('123a', undefined),
    buildTest('longSTRINGwithCASEchanges', 'longSTRINGwithCASEchanges'),

    buildTest('()', undefined),
    buildTest('...', undefined),
    buildTest('.[]', undefined),
    buildTest(' . ', undefined),
    buildTest(' [] ', undefined),
    buildTest('[]()', undefined),
    buildTest('', undefined),

    buildTest('func()', 'func()'),
    buildTest('func( )', 'func()'),
    buildTest(' func( ) ', 'func()'),
    buildTest(' FUNC( ) ', 'FUNC()'),

    buildTest('func(0)', 'func(0)'),
    buildTest('func( 0)', 'func(0)'),
    buildTest('func(0 )', 'func(0)'),
    buildTest('func( 0 )', 'func(0)'),
    buildTest(' func( 0 ) ', 'func(0)'),
    buildTest('func (0)', 'func(0)'),
    buildTest(' func ( 0 ) ', 'func(0)'),

    buildTest('func(a)', 'func(a)'),
    buildTest('func( a)', 'func(a)'),
    buildTest('func(a )', 'func(a)'),
    buildTest('func( a )', 'func(a)'),
    buildTest('func(a,b)', 'func(a,b)'),
    buildTest('func(a,b,c)', 'func(a,b,c)'),
    buildTest('func(a, b, c)', 'func(a,b,c)'),
    buildTest(' func ( a , b , c ) ', 'func(a,b,c)'),
    buildTest('func(a,0)', 'func(a,0)'),
    buildTest(' func ( a , 0 ) ', 'func(a,0)'),
    buildTest('func(a,)', undefined),
    buildTest('func(,a)', undefined),
    buildTest('func(a),', undefined),
    buildTest('func(a))', undefined),
    buildTest('func((a)', undefined),
    buildTest('f()()', 'f()()'),
    buildTest('f()(a)(b,c)', 'f()(a)(b,c)'),

    buildTest('array[]', undefined),
    buildTest('array[ ]', undefined),
    buildTest(' array[] ', undefined),
    buildTest('array []', undefined),

    buildTest('array[0]', 'array[0]'),
    buildTest('array[1]', 'array[1]'),
    buildTest('array[454654]', 'array[454654]'),
    buildTest('array[ 0 ]', 'array[0]'),
    buildTest('array[ 0]', 'array[0]'),
    buildTest('array[0 ]', 'array[0]'),
    buildTest('array [0]', 'array[0]'),
    buildTest('array [ 0 ]', 'array[0]'),
    buildTest(' array[0] ', 'array[0]'),
    buildTest(' array [ 0 ] ', 'array[0]'),

    buildTest('array[a]', 'array[a]'),
    buildTest('array[0,0]', undefined),
    buildTest('array[a,b]', undefined),
    buildTest('array[0][0]', 'array[0][0]'),
    buildTest('array[0][1][2]', 'array[0][1][2]'),

    buildTest('a.b', 'a.b'),
    buildTest(' a.b', 'a.b'),
    buildTest('a.b ', 'a.b'),
    buildTest(' a.b ', 'a.b'),
    buildTest('a.b.c.d.e', 'a.b.c.d.e'),

    buildTest('a .b', undefined),
    buildTest('a. b', undefined),
    buildTest('a . b', undefined),
    buildTest(' a . b ', undefined),

    buildTest('f()[0]', 'f()[0]'),
    buildTest('f[0]()', 'f[0]()'),

    buildTest('f().x', 'f().x'),
    buildTest('f.x()', 'f.x()'),

    buildTest('a[0].x', 'a[0].x'),
    buildTest('x.a[0]', 'x.a[0]'),

    buildTest('a.b().c()[0][5454]', 'a.b().c()[0][5454]'),
    buildTest(' a.b ( ).c ( ) [0] [5454] ', 'a.b().c()[0][5454]'),
    buildTest('a(0,x2,5,c(r[0].nn5)).y', 'a(0,x2,5,c(r[0].nn5)).y'),
    buildTest('a(0, x2,5,c(r[0].nn5,tt(x(), x(x(x()[45454])))) ).y', 'a(0,x2,5,c(r[0].nn5,tt(x(),x(x(x()[45454]))))).y'),
];

function buildTest(original, target) {
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

export default tests;