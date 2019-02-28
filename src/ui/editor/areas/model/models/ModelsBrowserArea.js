import {makeOutlinerArea} from '../../utils/outliner';
import {loadEntity} from '../../../../../model/entity.ts';
import {loadHqr} from '../../../../../hqr.ts';

let loading = false;
let entities = [];

async function loadEntities() {
    loading = true;
    const ress = await loadHqr('RESS.HQR');
    const entityInfo = ress.getEntry(44);
    entities = loadEntity(entityInfo);
    loading = false;
}

function getEntities() {
    if (entities.length === 0 && !loading) {
        loadEntities();
    }
    return entities;
}

export const EntityNode = {
    dynamic: true,
    name: data => `entity_${data.index}`,
    numChildren: () => 0,
    child: () => null,
    childData: () => null,
    onClick: () => {}
};

const ModelsNode = {
    dynamic: true,
    name: () => 'Models',
    numChildren: () => getEntities().length,
    child: () => EntityNode,
    childData: (data, idx) => getEntities()[idx]
};

const ModelsBrowserArea = makeOutlinerArea('models_list', 'Models', ModelsNode, {
    name: 'Models'
});

export default ModelsBrowserArea;

