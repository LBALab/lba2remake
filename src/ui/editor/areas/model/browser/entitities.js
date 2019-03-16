import {loadHqr} from '../../../../../hqr.ts';
import {loadEntity} from '../../../../../model/entity.ts';
import {loadModelsMetaData} from '../../../DebugData';

let loading = false;
let entities = [];

async function loadEntities() {
    loading = true;
    const ress = await loadHqr('RESS.HQR');
    await loadModelsMetaData();
    const entityInfo = ress.getEntry(44);
    entities = loadEntity(entityInfo);
    loading = false;
}

export function getEntities() {
    if (entities.length === 0 && !loading) {
        loadEntities();
    }
    return entities;
}
