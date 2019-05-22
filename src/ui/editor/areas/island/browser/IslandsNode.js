import React from 'react';
import islandsInfo from '../../../../../island/data/islands';
import DebugData from '../../../DebugData';
import { createRenderer } from '../../../../../renderer';

const indexStyle = {
    position: 'absolute',
    top: 0,
    right: 0,
    color: 'white',
    fontSize: '12px',
    background: 'black',
    opacity: 0.8,
    padding: '0 2px'
};

const IslandNode = {
    dynamic: true,
    name: island => island.name,
    numChildren: () => 0,
    allowRenaming: () => true,
    style: {
        height: '50px',
        background: '#1F1F1F',
        margin: '4px 0',
        padding: '0'
    },
    nameStyle: {
        lineHeight: '50px',
        height: '50px',
        display: 'block',
        position: 'absolute',
        left: 50,
        right: 0,
        top: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    selectedStyle: {
        background: 'white',
    },
    iconStyle: (data) => {
        let useThumb = false;
        if (data.name in icons) {
            useThumb = true;
        } else {
            const savedIcon = localStorage.getItem(`icon_model_entity_${data.name}`);
            if (savedIcon) {
                useThumb = true;
            }
        }

        return {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: useThumb ? '50px' : '20px',
            width: useThumb ? '50px' : '20px',
            padding: useThumb ? 0 : 15,
            margin: 0
        };
    },
    rename: null,
    onClick: (data, setRoot, component) => {
        const {setEntity} = component.props.rootStateHandler;
        setEntity(data.name);
    },
    onDoubleClick: (data, component) => {
        saveIcon(data, component);
    },
    selected: (data, component) => {
        if (!component.props.rootState)
            return false;
        const { entity } = component.props.rootState;
        return entity === data.name;
    },
    icon: (data, ignored, component) => getIcon(data, component),
    props: data => [
        {
            id: 'name',
            value: data.name,
            render: value => <div style={indexStyle}>{value}</div>
        }
    ]
};

const icons = {};
const iconsCanvas = document.createElement('canvas');
iconsCanvas.width = '50px';
iconsCanvas.heigth = '50px';
let iconRenderer = null;

function saveIcon(data, component) {
    if (component && component.props.rootState) {
        const { entity } = component.props.rootState;
        if (entity === data.name
            && DebugData.scope.island
            && DebugData.scope.island.entity === entity
            && DebugData.scope.island.threeObject) {
            DebugData.scope.grid.visible = false;
            if (!iconRenderer) {
                iconRenderer = createRenderer({webgl2: true}, iconsCanvas, {
                    preserveDrawingBuffer: true
                }, 'thumbnails');
                iconRenderer.applySceneryProps({
                    opacity: 0,
                    envInfo: { skyColor: [0, 0, 0] }
                });
            }
            iconRenderer.resize(50, 50);
            iconRenderer.render(DebugData.scope.scene);
            const dataUrl = iconsCanvas.toDataURL();
            if (dataUrl && dataUrl !== 'data:,') {
                icons[data.name] = dataUrl;
            }
            localStorage.setItem(`icon_model_entity_${data.name}`, dataUrl);
            DebugData.scope.grid.visible = true;
        }
    }
}

function getIcon(data, component) {
    if (data.name in icons) {
        return icons[data.name];
    }
    const savedIcon = localStorage.getItem(`icon_model_entity_${data.name}`);
    if (savedIcon) {
        if (!icons[data.name]) {
            icons[data.name] = savedIcon;
        }
        return savedIcon;
    }
    saveIcon(data, component);
    return 'editor/icons/entity.svg';
}

const IslandsNode = {
    dynamic: true,
    name: () => 'Islands',
    numChildren: () => islandsInfo.length,
    child: () => IslandNode,
    childData: (data, idx) => islandsInfo[idx],
    up: (data, collapsed, component) => {
        const {entity} = component.props.rootState;
        const {setEntity} = component.props.rootStateHandler;
        const index = Math.max(entity - 1, 0);
        const name = islandsInfo[index].name;
        setEntity(name);
        centerView(name);
    },
    down: (data, collapsed, component) => {
        const {entity} = component.props.rootState;
        const {setEntity} = component.props.rootStateHandler;
        const index = Math.min(entity + 1, islandsInfo.length - 1);
        const name = islandsInfo[index].name;
        setEntity(name);
        centerView(name);
    }
};

function centerView(name) {
    const ent = name;
    if (ent) {
        const elem = document.getElementById(`otl.Entities.${name(ent)}`);
        if (elem) {
            elem.scrollIntoView({block: 'center'});
        }
    }
}

export default IslandsNode;
