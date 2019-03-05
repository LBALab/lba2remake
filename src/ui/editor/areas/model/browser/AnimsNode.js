import { getEntities } from './entitities';

const animNames = {};

const getName = key => animNames[key] || key;

const AnimNode = {
    dynamic: true,
    name: data => getName(`anim_${data.index}_${data.animIndex}`),
    allowRenaming: () => true,
    rename: (data, newName) => {
        animNames[`anim_${data.index}_${data.animIndex}`] = newName;
    },
    numChildren: () => 0,
    child: () => null,
    childData: () => null,
    onClick: (data, setRoot, component) => {
        const {setAnim} = component.props.rootStateHandler;
        setAnim(data.index);
    },
    selected: (data, component) => {
        if (!component.props.rootState)
            return false;
        const { entity, anim } = component.props.rootState;
        return entity === data.entity && anim === data.index;
    },
    icon: () => 'editor/icons/anim.png',
};

const AnimsNode = {
    dynamic: true,
    name: () => 'Anims',
    numChildren: (ignored1, ignored2, component) => {
        const { entity } = component.props.rootState;
        const ent = getEntities()[entity];
        return ent ? ent.anims.length : 0;
    },
    child: () => AnimNode,
    childData: (ignored, idx, component) => {
        const { entity } = component.props.rootState;
        const ent = getEntities()[entity];
        if (!ent)
            return null;

        return Object.assign({
            entity: ent.index
        }, ent.anims[idx]);
    }
};

export default AnimsNode;
