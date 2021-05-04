import LocationsNode from '../../gameplay/locator/LocationsNode';

const libraries = [];

function collectLibraries(node, path = null) {
    let cPath = '';
    if (node.type !== 'all' && node.type !== 'planet')
        cPath = path ? `${path}/${node.name}` : node.name;

    if (node.sceneIndex !== undefined) {
        libraries.push({
            name: cPath,
            index: node.sceneIndex,
        });
    }
    for (const child of node.children) {
        collectLibraries(child, cPath);
    }
}

collectLibraries(LocationsNode);

export default libraries;
