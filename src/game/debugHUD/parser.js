export const T = {
    IDENTIFIER: 'IDENTIFIER',
    INDEX: 'INDEX',
    DOT_EXPR: 'DOT_EXPR',
    ARRAY_EXPR: 'ARRAY_EXPR',
    FUNC_CALL: 'FUNC_CALL'
};

const OK = (node, offset) => ({node, offset});

function parseExpression(e, end) {
    const res = parseDotExpr(e) || parseFunctionCall(e) || parseArrayExpr(e) || parseIdentifier(e) || parseIndex(e);
    if (res && e[res.offset] === end) {
        return res;
    }
}

window.parse = parseExpression;

function parseIdentifier(e) {
    const m = e.match(/^[A-Za-z_]\w*/);
    if (m) {
        return OK({
            type: T.IDENTIFIER,
            value: m[0]
        }, m[0].length);
    }
}

function parseIndex(e) {
    const m = e.match(/^\d+/);
    if (m) {
        return OK({
            type: T.INDEX,
            value: parseInt(m[0])
        }, m[0].length);
    }
}

function parseDotExpr(e) {
    const left = parseFunctionCall(e) || parseArrayExpr(e) || parseIdentifier(e);
    if (left && e[left.offset] === '.') {
        const e_right = e.substr(left.offset + 1);
        const right = parseExpression(e_right);
        if (right && right.node.type !== T.INDEX) {
            return OK({
                type: T.DOT_EXPR,
                left: left.node,
                right: right.node
            }, left.offset + 1 + right.offset);
        }
    }
}

function parseArrayExpr(e) {
    const left = parseIdentifier(e);
    if (left && e[left.offset] === '[') {
        const e_right = e.substr(left.offset + 1);
        const right = parseExpression(e_right, ']');
        if (right) {
            return OK({
                type: T.ARRAY_EXPR,
                left: left.node,
                right: right.node
            }, left.offset + right.offset + 2);
        }
    }
}

function parseFunctionCall(e) {
    const left = parseIdentifier(e);
    if (left && e[left.offset] === '(') {
        let offset = left.offset + 1;
        let args = [];
        while (true) {
            const e_arg = e.substr(offset);
            const arg = parseExpression(e_arg, ',');
            if (arg) {
                args.push(arg.node);
                offset += arg.offset + 1;
            } else {
                break;
            }
        }
        const e_last = e.substr(offset);
        const last = parseExpression(e_last, ')');
        if (last || e_last[0] === ')') {
            if (last)
                args.push(last.node);
            return OK({
                type: T.FUNC_CALL,
                left: left.node,
                args: args
            }, offset + (last ? last.offset : 0) + 1);
        }
    }
}
