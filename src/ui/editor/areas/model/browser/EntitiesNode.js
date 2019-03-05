import { getEntities } from './entitities';
import DebugData, { saveMetaData } from '../../../DebugData';

const EntityNode = {
    dynamic: true,
    name: entity => DebugData.metadata.entities[entity.index] || `entity_${entity.index}`,
    numChildren: () => 0,
    allowRenaming: () => true,
    rename: (entity, newName) => {
        DebugData.metadata.entities[entity.index] = newName;
        saveMetaData({
            type: 'models',
            subType: 'entities',
            subIndex: entity.index,
            value: newName
        });
    },
    onClick: (data, setRoot, component) => {
        const {setEntity} = component.props.rootStateHandler;
        setEntity(data.index);
    },
    selected: (data, component) => {
        if (!component.props.rootState)
            return false;
        const { entity } = component.props.rootState;
        return entity === data.index;
    },
    icon: () => 'editor/icons/entity.png',
};

const EntitiesNode = {
    dynamic: true,
    name: () => 'Entities',
    numChildren: () => getEntities().length,
    child: () => EntityNode,
    childData: (data, idx) => getEntities()[idx],
    up: (data, collapsed, component) => {
        const {entity} = component.props.rootState;
        const {setEntity} = component.props.rootStateHandler;
        setEntity(Math.max(entity - 1, 0));
    },
    down: (data, collapsed, component) => {
        const {entity} = component.props.rootState;
        const {setEntity} = component.props.rootStateHandler;
        setEntity(Math.min(entity + 1, getEntities().length - 1));
    }
};

export default EntitiesNode;
