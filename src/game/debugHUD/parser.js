export const T = {
    IDENTIFIER: 'IDENTIFIER',
    INDEX: 'INDEX',
    DOT_EXPR: 'DOT_EXPR',
    ARRAY_EXPR: 'ARRAY_EXPR'
};

const OK = (node, offset) => ({node, offset});

let count = 0;

const IN = (type) => {
    let text = '';
    for (let i = 0; i < count; ++i)
        text += '  ';
    text += '->' + type;
    console.log(text);
    count++;
};

const OUT = (type) => {
    count--;
    let text = '';
    for (let i = 0; i < count; ++i)
        text += '  ';
    text += '<-' + type;
    console.log(text);
};

const MATCH = () => {
    let text = '';
    for (let i = 0; i < count; ++i)
        text += '  ';
    text += 'MATCH!';
    console.log(text);
    count--;
};

function parseExpression(e, end) {
    IN('EXPR');
    const res = parseDotExpr(e) || parseArrayExpr(e) || parseIdentifier(e) || parseIndex(e);
    if (res && e[res.offset] === end) {
        MATCH();
        return res;
    }
    OUT('EXPR');
}

window.parse = function(e) {
    count = 0;
    return parseExpression(e);
};

function parseIdentifier(e) {
    IN('ID');
    const m = e.match(/^[A-Za-z_]\w*/);
    if (m) {
        MATCH();
        return OK({
            type: T.IDENTIFIER,
            value: m[0]
        }, m[0].length);
    }
    OUT('ID');
}

function parseIndex(e) {
    IN('INDEX');
    const m = e.match(/^\d+/);
    if (m) {
        MATCH();
        return OK({
            type: T.INDEX,
            value: parseInt(m[0])
        }, m[0].length);
    }
    OUT('INDEX');
}

function parseDotExpr(e) {
    IN('DOT');
    const left = parseArrayExpr(e) || parseIdentifier(e);
    if (left && e[left.offset] === '.') {
        const e_right = e.substr(left.offset + 1);
        const right = parseExpression(e_right);
        if (right && right.node.type !== T.INDEX) {
            MATCH();
            return OK({
                type: T.DOT_EXPR,
                left: left.node,
                right: right.node
            }, left.offset + 1 + right.offset);
        }
    }
    OUT('DOT');
}

function parseArrayExpr(e) {
    IN('ARR');
    const left = parseIdentifier(e);
    if (left && e[left.offset] === '[') {
        const e_right = e.substr(left.offset + 1);
        const right = parseExpression(e_right, ']');
        if (right) {
            MATCH();
            return OK({
                type: T.ARRAY_EXPR,
                left: left.node,
                right: right.node
            }, left.offset + right.offset + 2);
        }
    }
    OUT('ARR');
}
