import { getEntities } from './entitities';

const EntityNode = {
    dynamic: true,
    name: data => data.name || `entity_${data.index}`,
    numChildren: () => 0,
    allowRenaming: () => true,
    rename: (data, newName) => {
        data.name = newName;
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
