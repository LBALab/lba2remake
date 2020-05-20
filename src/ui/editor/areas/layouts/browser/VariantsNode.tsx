import * as React from 'react';
import { map } from 'lodash';
import DebugData from '../../../DebugData';
import { findAllVariants } from '../variants/search';

const scenesStyle = {
    position: 'absolute' as const,
    bottom: 2,
    right: 2,
    color: 'rgba(200, 255, 255, 0.8)',
    fontSize: '12px',
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '0 2px'
};

const sizeStyle = {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    color: 'white',
    fontSize: '14px',
    background: 'black',
    opacity: 0.8,
    padding: '0 2px'
};

const VariantNode = {
    dynamic: true,
    key: ({key}) => key,
    name: ({id}) => id === 'default' ? 'Default' : `Variant ${id}`,
    numChildren: () => 0,
    allowRenaming: () => false,
    style: {
        height: '60px',
        background: '#1F1F1F',
        margin: '4px 0',
        padding: '0'
    },
    nameStyle: {
        lineHeight: '60px',
        height: '60px',
        display: 'block',
        position: 'absolute',
        left: 60,
        right: 0,
        top: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    selectedStyle: {
        background: 'white',
    },
    iconStyle: () => ({
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '20px',
        width: '20px',
        padding: 15,
        margin: 0
    }),
    onClick: (data, _setRoot, component) => {
        const { setVariant } = component.props.rootStateHandler;
        if (data.id === 'default') {
            setVariant(null);
        } else {
            setVariant(data);
        }
    },
    selected: (data, _ignored, component) => {
        if (!component.props.rootState)
            return false;

        const { variant } = component.props.rootState;
        if (!variant && data.id === 'default') {
            return true;
        }
        return variant && variant.id === data.id;
    },
    icon: () => 'editor/icons/entity.svg',
    props: data => [
        {
            id: 'scenes',
            value: data.scenes,
            render: scenes => <div style={scenesStyle}>
                {scenes && scenes.length && 'Scenes:'}
                {map(scenes, scene => <React.Fragment key={scene}>
                    &nbsp;
                    <span>
                        {scene}
                    </span>
                </React.Fragment>
            )}</div>
        },
        {
            id: 'size',
            value: `${data.nX}x${data.nY}x${data.nZ}`,
            render: value => <div style={sizeStyle}>{value}</div>
        }
    ]
};

const variantsCache = {};
const loading = {};

function getVariants() {
    const { library, layout } = DebugData.scope;
    if (!library || !layout) {
        return [];
    }
    const key = `${library.index}_${layout.index}`;
    if (key in variantsCache) {
        return variantsCache[key];
    }
    if (!(key in loading)) {
        loading[key] = true;
        const lDef = {
            library: library.index,
            index: layout.index,
            props: layout.props
        };
        findAllVariants(lDef).then((variants) => {
            variantsCache[key] = [
                {
                    id: 'default',
                    nX: layout.props.nX,
                    nY: layout.props.nY,
                    nZ: layout.props.nZ
                },
                ...variants
            ];
            loading[key] = false;
        });
    }
    return [];
}

const VariantsNode = {
    dynamic: true,
    name: () => 'Layouts',
    numChildren: () => getVariants().length,
    child: () => VariantNode,
    childData: (_data, idx) => getVariants()[idx] || { id: idx },
    up: (_data, _collapsed, component) => {
        const {variant} = component.props.rootState;
        const {setVariant} = component.props.rootStateHandler;
        const prevIndex = variant ? variant.id : 0;
        const index = Math.max(prevIndex - 1, 0);
        setVariant(index > 0 ? getVariants()[index] : null);
        centerView(index);
    },
    down: (_data, _collapsed, component) => {
        const {variant} = component.props.rootState;
        const {setVariant} = component.props.rootStateHandler;
        const prevIndex = variant ? variant.id : 0;
        const index = Math.min(prevIndex + 1, getVariants().length - 1);
        setVariant(index > 0 ? getVariants()[index] : null);
        centerView(index);
    }
};

function centerView(index) {
    const variant = getVariants()[index];
    if (variant) {
        const elem = document.getElementById(`otl.Variants.${variant.key}`);
        if (elem) {
            elem.scrollIntoView({block: 'center'});
        }
    }
}

export default VariantsNode;
