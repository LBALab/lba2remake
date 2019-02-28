const BodyNode = {
    dynamic: true,
    name: data => data.name || `body_${data.index}`,
    allowRenaming: () => true,
    rename: (data, newName) => {
        data.name = newName;
    },
    numChildren: () => 0,
    child: () => null,
    childData: () => null,
    onClick: (data, setRoot, component) => {
        const {setBody} = component.props.rootStateHandler;
        setBody(data.entity, data.index);
    },
    props: data => [
        {
            id: 'index',
            value: data.bodyIndex,
            render: value => `#${value}`
        }
    ],
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
    numChildren: data => data.bodies.length,
    child: () => BodyNode,
    childData: (data, idx) => Object.assign({
        entity: data.index
    }, data.bodies[idx]),
    noCollapse: true
};

export default BodiesNode;
