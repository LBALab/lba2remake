import {loadEntity} from '../../../../../model/entity';
import {loadModelsMetaData} from '../../../DebugData';
import { getResource, ResourceType } from '../../../../../resources';

let entities = [];

export async function loadEntities() {
    const entityInfo = await getResource(ResourceType.ENTITIES);
    await loadModelsMetaData();
    entities = loadEntity(entityInfo.getBuffer());
}

export function getEntities() {
    return entities;
}
