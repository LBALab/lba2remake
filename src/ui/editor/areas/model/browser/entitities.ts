import {loadEntity} from '../../../../../model/entity';
import {loadModelsMetaData} from '../../../DebugData';
import { getEntities as getResourceEntities } from '../../../../../resources';

let entities = [];

export async function loadEntities() {
    const entityInfo = await getResourceEntities();
    await loadModelsMetaData();
    entities = loadEntity(entityInfo.getBuffer());
}

export function getEntities() {
    return entities;
}
