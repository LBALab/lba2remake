import { find, concat } from 'lodash';

export default function findScenePath(node, index, path = []) {
    if (node.props) {
        const indexProp = find(node.props, p => p.id === 'index');
        if (indexProp && indexProp.value === index) {
            return concat(path, node);
        }
    }
    for (let i = 0; i < node.children.length; i += 1) {
        const foundPath = findScenePath(node.children[i], index, concat(path, node));
        if (foundPath) {
            return foundPath;
        }
    }
    return null;
}
