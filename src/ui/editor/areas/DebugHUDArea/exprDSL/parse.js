import T from './types';

export const Trim = {
    NONE: 0,
    LEFT: 1,
    RIGHT: 2,
    BOTH: 3
};

const OK = (node, offset) => ({node, offset});

export function parseProgram(e) {
    return parseAssignment(e) || parseExpression(e);
}

function parseAssignment(e) {
    const left = parseIdentifier(e, Trim.BOTH);
    if (left && e[left.offset] === '=') {
        const e_right = e.substr(left.offset + 1);
        const right = parseExpression(e_right);
        if (right) {
            return OK({
                type: T.ASSIGNMENT,
                left: left.node,
                right: right.node
            }, left.offset + right.offset + 1);
        }
    }
    return null;
}

function parseExpression(e, end, trim = Trim.BOTH) {
    const res =
        parseDotExpr(e, end, trim) ||
        parseCall(e, trim) ||
        parseIdentifier(e, trim) ||
        parseIndex(e, trim);

    if (res) {
        let offset = res.offset;
        const rTrim = trim & Trim.RIGHT;
        if (rTrim === Trim.RIGHT) {
            while (e[offset] === ' ')
                offset += 1;
        }

        if (e[offset] === end)
            return res;
    }
    return null;
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
    return null;
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
    return null;
}

function parseDotExpr(e, end, trim) {
    const lTrim = trim & Trim.LEFT;
    const left = parseCall(e, lTrim) || parseIdentifier(e, lTrim);
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
    return null;
}

function parseCall(e, trim) {
    const left = parseIdentifier(e, trim | Trim.RIGHT);
    if (left) {
        let res,
            target;
        let offset = left.offset;
        do {
            const e_s = e.substr(offset);
            const brackets = parseBrackets(e_s);
            const args = !brackets && parseArgumentList(e_s);
            target = brackets || args;
            if (target) {
                offset += target.offset;
                let tCount = 0;
                while (e[offset] === ' ') {
                    offset += 1;
                    tCount += 1;
                }
                if (tCount > 0 && e[offset] === '.') {
                    return null;
                }
                if (brackets) {
                    res = {
                        type: T.ARRAY_EXPR,
                        left: res || left.node,
                        right: brackets.node
                    };
                } else {
                    res = {
                        type: T.FUNC_CALL,
                        left: res || left.node,
                        args: args.node
                    };
                }
            }
        } while (target);

        if (res) {
            return OK(res, offset);
        }
    }
    return null;
}

function parseBrackets(e) {
    if (e[0] === '[') {
        const e_content = e.substr(1);
        const content = parseExpression(e_content, ']', Trim.BOTH);
        if (content) {
            return OK(content.node, content.offset + 2);
        }
    }
    return null;
}

function parseArgumentList(e) {
    if (e[0] === '(') {
        let offset = 1;
        const args = [];
        // eslint-disable-next-line no-constant-condition
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
        if (last) {
            args.push(last.node);
            offset += last.offset + 1;
            return OK(args, offset);
        } else if (args.length === 0) {
            while (e[offset] === ' ') {
                offset += 1;
            }
            if (e[offset] === ')') {
                offset += 1;
                return OK(args, offset);
            }
        }
    }
    return null;
}
