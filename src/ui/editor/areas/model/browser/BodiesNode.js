import { getEntities } from './entitities';

const bodyNames = {};

const getName = key => bodyNames[key] || key;

const BodyNode = {
    dynamic: true,
    name: data => getName(`body_${data.index}_${data.bodyIndex}`),
    allowRenaming: () => true,
    rename: (data, newName) => {
        bodyNames[`body_${data.index}_${data.bodyIndex}`] = newName;
    },
    numChildren: () => 0,
    child: () => null,
    childData: () => null,
    onClick: (data, setRoot, component) => {
        const {setBody} = component.props.rootStateHandler;
        setBody(data.index);
    },
    selected: (data, component) => {
        if (!component.props.rootState)
            return false;
        const { entity, body } = component.props.rootState;
        return entity === data.entity && body === data.index;
    },
    icon: () => 'editor/icons/body.png',
};

const BodiesNode = {
    dynamic: true,
    name: () => 'Bodies',
    numChildren: (ignored1, ignored2, component) => {
        const { entity } = component.props.rootState;
        const ent = getEntities()[entity];
        return ent ? ent.bodies.length : 0;
    },
    child: () => BodyNode,
    childData: (ignored, idx, component) => {
        const { entity } = component.props.rootState;
        const ent = getEntities()[entity];
        if (!ent)
            return null;

        return Object.assign({
            entity: ent.index
        }, ent.bodies[idx]);
    }
};

export default BodiesNode;
