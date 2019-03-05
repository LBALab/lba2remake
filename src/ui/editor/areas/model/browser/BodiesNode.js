import { findIndex } from 'lodash';
import { getEntities } from './entitities';

const bodyNames = {};

const getKey = (body, idx) => {
    if (body && body.index !== undefined && body.bodyIndex !== undefined) {
        return `body_${body.index}_${body.bodyIndex}`;
    } else if (idx !== undefined) {
        return `unknown_body_${idx}`;
    }
    return null;
};

const getName = (body, idx) => {
    const key = getKey(body, idx);
    return bodyNames[key] || key;
};

const BodyNode = {
    dynamic: true,
    name: (body, idx) => getName(body, idx),
    allowRenaming: () => true,
    rename: (body, newName) => {
        const key = getKey(body);
        if (key !== null) {
            bodyNames[key] = newName;
        }
    },
    numChildren: () => 0,
    child: () => null,
    childData: () => null,
    onClick: (data, setRoot, component) => {
        const {setBody} = component.props.rootStateHandler;
        setBody(data.index);
    },
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
            }
        }
    }
};

export default BodiesNode;
