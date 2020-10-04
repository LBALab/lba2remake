import {loadEntity} from '../../../../../model/entity';
import {loadModelsMetaData} from '../../../DebugData';
import { loadResource, ResourceName } from '../../../../../resources';

let entities = [];

export async function loadEntities() {
    const entityInfo = await loadResource(ResourceName.ENTITIES);
    await loadModelsMetaData();
    entities = loadEntity(entityInfo.getBuffer());
}

export function getEntities() {
    return entities;
}
