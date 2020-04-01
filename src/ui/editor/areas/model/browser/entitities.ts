import {loadEntity} from '../../../../../model/entity';
import {loadModelsMetaData} from '../../../DebugData';
import { loadResource, ResourceType } from '../../../../../resources';

let entities = [];

export async function loadEntities() {
    const entityInfo = await loadResource(ResourceType.ENTITIES);
    await loadModelsMetaData();
    entities = loadEntity(entityInfo.getBuffer());
}

export function getEntities() {
    return entities;
}
