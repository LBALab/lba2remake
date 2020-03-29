import {loadEntity} from '../../../../../model/entity';
import {loadModelsMetaData} from '../../../DebugData';
import { getResource } from '../../../../../resources';

let entities = [];

export async function loadEntities() {
    const ress = await getResource('RESS');
    await loadModelsMetaData();
    const entityInfo = ress.getEntry(44);
    entities = loadEntity(entityInfo);
}

export function getEntities() {
    return entities;
}
