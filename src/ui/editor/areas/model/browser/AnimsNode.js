import React from 'react';
import { map, filter, find, findIndex } from 'lodash';
import { getEntities } from './entitities';
import DebugData, { saveMetaData } from '../../../DebugData';
import { Orientation } from '../../../layout';
import { makeOutlinerArea } from '../../utils/outliner';
import { findRefsInScenes } from './findRefsInScenes';

const idxStyle = {
    fontSize: 13,
    position: 'absolute',
    right: 0,
    bottom: 0,
    padding: 2,
    color: 'white',
    background: 'black',
    opacity: 0.8
};

const AnimNode = {
    dynamic: true,
    name: (anim) => {
        if (anim && anim.index !== undefined) {
            return DebugData.metadata.anims[anim.index] || `anim_${anim.index}`;
        }
        return 'unknown';
    },
    key: (anim, idx) => `anim_${idx}`,
    allowRenaming: () => true,
    rename: (anim, newName) => {
        if (anim && anim.index !== undefined) {
            DebugData.metadata.anims[anim.index] = newName;
            saveMetaData({
                type: 'models',
                subType: 'anims',
                subIndex: anim.index,
                value: newName
            });
        }
    },
    ctxMenu: [
        {
            name: 'Find all references',
            onClick: (component, anim) => {
                findAllReferencesToAnim(anim, component).then((area) => {
                    component.props.split(Orientation.VERTICAL, area);
                });
            }
        },
        {
            name: 'Find in scripts',
            onClick: (component, anim) => {
                findRefsInScenes('anim', anim).then((area) => {
                    const editor = component.props.editor;
                    editor.switchEditor('game');
                    editor.split([0], Orientation.HORIZONTAL, area);
                });
            }
        }
    ],
    numChildren: () => 0,
    child: () => null,
    childData: () => null,
    onClick: (data, setRoot, component) => {
        const {setAnim} = component.props.rootStateHandler;
        setAnim(data.index);
    },
    props: anim => [
        {
            id: 'index',
            value: anim.animIndex,
            render: value => <span style={idxStyle}>{value}</span>
        }
    ],
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
                centerView(newIndex);
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
                centerView(newIndex);
            }
        }
    }
};

function centerView(index) {
    const elem = document.getElementById(`otl.Anims.anim_${index}`);
    if (elem) {
        elem.scrollIntoView({block: 'center'});
    }
}

async function findAllReferencesToAnim(anim, component) {
    const name = DebugData.metadata.anims[anim.index] || `anim_${anim.index}`;
    const entities = getEntities();
    const filteredEntities = filter(entities, e => find(e.anims, a => a.index === anim.index));
    const area = makeOutlinerArea(
        `references_to_${name}`,
        `References to ${name}`,
        {
            name: `References to ${name}`,
            icon: 'editor/icons/anim.png',
            children: map(filteredEntities, e => ({
                name: DebugData.metadata.entities[e.index] || `entity_${e.index}`,
                icon: 'editor/icons/entity.png',
                iconStyle: {
                    width: 20,
                    height: 20
                },
                children: [],
                onClick: () => {
                    const {setEntity, setAnim} = component.props.rootStateHandler;
                    setEntity(e.index);
                    setAnim(anim.index);
                }
            }))
        },
        {
            icon: 'ref.png'
        }
    );
    return area;
}

export default AnimsNode;
