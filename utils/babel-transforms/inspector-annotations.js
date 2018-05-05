const {find, map} = require('lodash');

function getLocation(t, path, state) {
    const location = path.node.loc;
    const line = (location
        && location.start.line !== null
        && location.start.line !== undefined)
        ? `:${location.start.line}`
        : '';
    const filename = state.file.opts.sourceFileName;
    return t.stringLiteral(`${filename}${line}`);
}

function findAnnotation(node) {
    const comment = find(node.leadingComments, c => c.value.match(/^ *@inspector\(.*\) *$/));
    if (comment) {
        const m = comment.value.match(/^ *@inspector\((.*)\) *$/);
        if (m) {
            const values = m[1].split(',');
            return map(values, v => v.replace(/ /g, ''));
        }
        return m[1];
    }
    return null;
}

module.exports = (ctx) => {
    const t = ctx.types;
    return {
        visitor: {
            ObjectProperty(path, state) {
                const annotValues = findAnnotation(path.node);
                if (annotValues) {
                    const node = path.node;
                    const id = node.key.name;
                    const valueType = node.value.type;
                    if (valueType === 'FunctionExpression' || valueType === 'ArrowFunctionExpression') {
                        path.replaceWith(t.objectProperty(
                            t.identifier(id),
                            t.callExpression(
                                t.identifier('inspector_patch_fct'),
                                [
                                    node.value,
                                    annotValues.includes('locate')
                                        ? getLocation(t, path, state)
                                        : t.nullLiteral(),
                                    t.booleanLiteral(annotValues.includes('pure'))
                                ]
                            )
                        ));
                    } else if (valueType !== 'CallExpression' || node.value.callee.name !== 'inspector_patch_fct') {
                        throw path.buildCodeFrameError(`Inspector annotations are unsupported on ${valueType} ${id}`);
                    }
                }
            }
        }
    };
};
