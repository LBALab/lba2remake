import T from './types';

export const Trim = {
    NONE: 0,
    LEFT: 1,
    RIGHT: 2,
    BOTH: 3
};

const OK = (node, offset) => ({node, offset});

export function parseExpression(e, end, trim = Trim.BOTH) {
    const res =
        parseDotExpr(e, end, trim) ||
        parseFunctionCall(e, trim) ||
        parseArrayExpr(e, trim) ||
        parseIdentifier(e, trim) ||
        parseIndex(e, trim);

    if (res) {
        let offset = res.offset;
        const rTrim = trim & Trim.RIGHT;
        if (rTrim === Trim.RIGHT) {
            while (e[offset] === ' ')
                offset++;
        }

        if (e[offset] === end)
            return res;
    }
}

const ID_RE = [];
ID_RE[Trim.NONE] = /^([A-Za-z_]\w*)/;
ID_RE[Trim.LEFT] = /^ *([A-Za-z_]\w*)/;
ID_RE[Trim.RIGHT] = /^([A-Za-z_]\w*) */;
ID_RE[Trim.BOTH] = /^ *([A-Za-z_]\w*) */;

function parseIdentifier(e, trim) {
    const m = e.match(ID_RE[trim]);
    if (m) {
        return OK({
            type: T.IDENTIFIER,
            value: m[1]
        }, m[0].length);
    }
}

const INDEX_RE = [];
INDEX_RE[Trim.NONE] = /^(\d+)/;
INDEX_RE[Trim.LEFT] = /^ *(\d+)/;
INDEX_RE[Trim.RIGHT] = /^(\d+) */;
INDEX_RE[Trim.BOTH] = /^ *(\d+) */;

function parseIndex(e, trim) {
    const m = e.match(INDEX_RE[trim]);
    if (m) {
        return OK({
            type: T.INDEX,
            value: parseInt(m[1])
        }, m[0].length);
    }
}

function parseDotExpr(e, end, trim) {
    const lTrim = trim & Trim.LEFT;
    const left = parseFunctionCall(e, lTrim) || parseArrayExpr(e, lTrim) || parseIdentifier(e, lTrim);
    if (left && e[left.offset] === '.') {
        const e_right = e.substr(left.offset + 1);
        const right = parseExpression(e_right, end, trim & Trim.RIGHT);
        if (right && right.node.type !== T.INDEX) {
            return OK({
                type: T.DOT_EXPR,
                left: left.node,
                right: right.node
            }, left.offset + 1 + right.offset);
        }
    }
}

function parseArrayExpr(e, trim) {
    const left = parseIdentifier(e, trim | Trim.RIGHT);
    if (left && e[left.offset] === '[') {
        const e_right = e.substr(left.offset + 1);
        const right = parseExpression(e_right, ']', trim.BOTH);
        if (right) {
            return OK({
                type: T.ARRAY_EXPR,
                left: left.node,
                right: right.node
            }, left.offset + right.offset + 2);
        }
    }
}

function parseFunctionCall(e, trim) {
    const left = parseIdentifier(e, trim | Trim.RIGHT);
    if (left && e[left.offset] === '(') {
        let offset = left.offset + 1;
        let args = [];
        while (true) {
            const e_arg = e.substr(offset);
            const arg = parseExpression(e_arg, ',', Trim.BOTH);
            if (arg) {
                args.push(arg.node);
                offset += arg.offset + 1;
            } else {
                break;
            }
        }
        const e_last = e.substr(offset);
        const last = parseExpression(e_last, ')', Trim.BOTH);
        let ok = false;
        if (last) {
            args.push(last.node);
            offset += last.offset + 1;
            ok = true;
        } else {
            while (e[offset] === ' ') {
                offset++;
            }
            if (e[offset] === ')') {
                offset++;
                ok = true;
            }
        }
        if (ok) {
            const rTrim = trim & Trim.RIGHT;
            if (rTrim === Trim.RIGHT) {
                while (e[offset] === ' ') {
                    offset++;
                }
            }
            return OK({
                type: T.FUNC_CALL,
                left: left.node,
                args: args
            }, offset);
        }
    }
}
