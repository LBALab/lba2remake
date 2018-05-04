const nodePath = require('path');
const {find, map} = require('lodash');

function getLocation(t, path, state) {
    const location = path.node.loc;
    const line = (location
        && location.start.line !== null
        && location.start.line !== undefined)
        ? `:${location.start.line}`
        : '';
    const filename = nodePath.relative(
        process.cwd(),
        nodePath.resolve(state.file.opts.filename)
    );
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
            ObjectMethod(path, state) {
                const values = findAnnotation(path.node);
                if (values) {
                    const node = path.node;
                    const id = node.key.name;
                    path.replaceWith(t.objectProperty(
                        t.identifier(id),
                        t.callExpression(
                            t.identifier('inspector_patch_fct'),
                            [
                                t.functionExpression(
                                    null,
                                    node.params,
                                    node.body
                                ),
                                values.includes('locate')
                                    ? getLocation(t, path, state)
                                    : t.nullLiteral(),
                                t.booleanLiteral(values.includes('pure'))
                            ]
                        )
                    ));
                }
            }
        }
    };
};
