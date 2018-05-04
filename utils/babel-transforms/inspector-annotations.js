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

module.exports = ({t}) => {
    return {
        visitor: {
            ObjectMethod(path) {
                const name = path.scope.generateDeclaredUidIdentifier('fistfuck');
                const values = findAnnotation(path.node);
                console.log(values);
            }
        }
    };
};
