import { loadModelsMetaData } from '../../../DebugData';
import { getEntities as getResourceEntities } from '../../../../../resources';

let entities = [];

export async function loadEntities() {
    await loadModelsMetaData();
    entities = await getResourceEntities();
}

export function getEntities() {
    return entities;
}
