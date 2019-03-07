import React from 'react';
import { map, filter, find, findIndex } from 'lodash';
import { getEntities } from './entitities';
import DebugData, { saveMetaData } from '../../../DebugData';
import { Orientation } from '../../../layout';
import { makeOutlinerArea } from '../../utils/outliner';

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

const BodyNode = {
    dynamic: true,
    name: (body) => {
        if (body && body.index !== undefined) {
            return DebugData.metadata.bodies[body.index] || `body_${body.index}`;
        }
        return 'unknown';
    },
    key: (body, idx) => `body_${idx}`,
    allowRenaming: () => true,
    rename: (body, newName) => {
        if (body && body.index !== undefined) {
            DebugData.metadata.bodies[body.index] = newName;
            saveMetaData({
                type: 'models',
                subType: 'bodies',
                subIndex: body.index,
                value: newName
            });
        }
    },
    ctxMenu: [
        {
            name: 'Find all references',
            onClick: (component, body) => {
                findAllReferencesToBody(body, component).then((area) => {
                    component.props.split(Orientation.VERTICAL, area);
                });
            }
        }
    ],
    numChildren: () => 0,
    child: () => null,
    childData: () => null,
    onClick: (data, setRoot, component) => {
        const {setBody} = component.props.rootStateHandler;
        setBody(data.index);
    },
    props: body => [
        {
            id: 'index',
            value: body.bodyIndex,
            render: value => <span style={idxStyle}>{value}</span>
        }
    ],
    selected: (data, component) => {
        if (!component.props.rootState || !data)
            return false;
        const { body } = component.props.rootState;
        return body === data.index;
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
        return ent && ent.bodies[idx];
    },
    up: (data, collapsed, component) => {
        const {entity, body} = component.props.rootState;
        const {setBody} = component.props.rootStateHandler;
        const ent = getEntities()[entity];
        if (ent) {
            const idx = findIndex(ent.bodies, b => b.index === body);
            if (idx !== -1) {
                const newIndex = Math.max(idx - 1, 0);
                setBody(ent.bodies[newIndex].index);
                centerView(newIndex);
            }
        }
    },
    down: (data, collapsed, component) => {
        const {entity, body} = component.props.rootState;
        const {setBody} = component.props.rootStateHandler;
        const ent = getEntities()[entity];
        if (ent) {
            const idx = findIndex(ent.bodies, b => b.index === body);
            if (idx !== -1) {
                const newIndex = Math.min(idx + 1, ent.bodies.length - 1);
                setBody(ent.bodies[newIndex].index);
                centerView(newIndex);
            }
        }
    }
};

function centerView(index) {
    const elem = document.getElementById(`otl.Bodies.body_${index}`);
    if (elem) {
        elem.scrollIntoView({block: 'center'});
    }
}

async function findAllReferencesToBody(body, component) {
    const name = DebugData.metadata.bodies[body.index] || `body_${body.index}`;
    const entities = getEntities();
    const filteredEntities = filter(entities, e => find(e.bodies, b => b.index === body.index));
    const area = makeOutlinerArea(
        `references_to_${name}`,
        `References to ${name}`,
        {
            name: `References to ${name}`,
            children: map(filteredEntities, e => ({
                name: DebugData.metadata.entities[e.index] || `entity_${e.index}`,
                children: [],
                onClick: () => {
                    const {setEntity, setBody} = component.props.rootStateHandler;
                    setEntity(e.index);
                    setBody(body.index);
                }
            }))
        }
    );
    return area;
}

export default BodiesNode;
