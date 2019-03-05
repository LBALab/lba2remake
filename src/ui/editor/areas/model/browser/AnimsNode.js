import { findIndex } from 'lodash';
import { getEntities } from './entitities';

const animNames = {};

const getKey = (anim, idx) => {
    if (anim && anim.index !== undefined && anim.animIndex !== undefined) {
        return `anim_${anim.index}_${anim.animIndex}`;
    } else if (idx !== undefined) {
        return `unknown_anim_${idx}`;
    }
    return null;
};

const getName = (anim, idx) => {
    const key = getKey(anim, idx);
    return animNames[key] || key;
};

const AnimNode = {
    dynamic: true,
    name: (anim, idx) => getName(anim, idx),
    allowRenaming: () => true,
    rename: (anim, newName) => {
        const key = getKey(anim);
        if (key !== null) {
            animNames[key] = newName;
        }
    },
    numChildren: () => 0,
    child: () => null,
    childData: () => null,
    onClick: (data, setRoot, component) => {
        const {setAnim} = component.props.rootStateHandler;
        setAnim(data.index);
    },
    selected: (data, component) => {
        if (!component.props.rootState || !data)
            return false;
        const { anim } = component.props.rootState;
        return anim === data.index;
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
        return ent && ent.anims[idx];
    },
    up: (data, collapsed, component) => {
        const {entity, anim} = component.props.rootState;
        const {setAnim} = component.props.rootStateHandler;
        const ent = getEntities()[entity];
        if (ent) {
            const idx = findIndex(ent.anims, b => b.index === anim);
            if (idx !== -1) {
                const newIndex = Math.max(idx - 1, 0);
                setAnim(ent.anims[newIndex].index);
            }
        }
    },
    down: (data, collapsed, component) => {
        const {entity, anim} = component.props.rootState;
        const {setAnim} = component.props.rootStateHandler;
        const ent = getEntities()[entity];
        if (ent) {
            const idx = findIndex(ent.anims, b => b.index === anim);
            if (idx !== -1) {
                const newIndex = Math.min(idx + 1, ent.anims.length - 1);
                setAnim(ent.anims[newIndex].index);
            }
        }
    }
};

export default AnimsNode;
