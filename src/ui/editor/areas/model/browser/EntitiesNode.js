import { getEntities } from './entitities';
import DebugData, { saveMetaData } from '../../../DebugData';

const name = entity =>
    DebugData.metadata.entities[entity.index] || `entity_${entity.index}`;

const EntityNode = {
    dynamic: true,
    name,
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
        const index = Math.max(entity - 1, 0);
        setEntity(index);
        centerView(index);
    },
    down: (data, collapsed, component) => {
        const {entity} = component.props.rootState;
        const {setEntity} = component.props.rootStateHandler;
        const index = Math.min(entity + 1, getEntities().length - 1);
        setEntity(index);
        centerView(index);
    }
};

function centerView(index) {
    const ent = getEntities()[index];
    if (ent) {
        const elem = document.getElementById(`otl.Entities.${name(ent)}`);
        if (elem) {
            elem.scrollIntoView({block: 'center'});
        }
    }
}

export default EntitiesNode;
