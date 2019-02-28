const AnimNode = {
    dynamic: true,
    name: data => `anim_${data.index}`,
    numChildren: () => 0,
    child: () => null,
    childData: () => null,
    onClick: (data, setRoot, component) => {
        const {setAnim} = component.props.rootStateHandler;
        setAnim(data.entity, data.index);
    },
    props: data => [
        {
            id: 'index',
            value: data.animIndex,
            render: value => `#${value}`
        }
    ],
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
    numChildren: data => data.anims.length,
    child: () => AnimNode,
    childData: (data, idx) => Object.assign({
        entity: data.index
    }, data.anims[idx]),
    noCollapse: true
};

export default AnimsNode;
