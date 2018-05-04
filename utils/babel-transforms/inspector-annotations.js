const {find, map} = require('lodash');

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
            ObjectMethod(path) {
                const values = findAnnotation(path.node);
                console.log(path.node);
                if (values) {
                    const node = path.node;
                    const id = node.key.name;
                    path.replaceWith(t.objectProperty(
                        t.identifier(id),
                        t.functionExpression(
                            t.identifier(id),
                            node.params,
                            node.body
                        )
                    ));
                }
            }
        }
    };
};
