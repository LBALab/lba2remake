import React from 'react';
import islandsInfo from '../../../../../island/data/islands';
import DebugData, { saveMetaData } from '../../../DebugData';
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
    name: (island) => {
        const index = islandsInfo.findIndex(i => i.name === island.name);
        return DebugData.metadata.islands[index] || island.name;
    },
    numChildren: () => 0,
    allowRenaming: () => true,
    style: {
        height: '50px',
        background: '#1F1F1F',
        margin: '4px 0',
        padding: '0',
        fontSize: '12px'
    },
    nameStyle: {
        lineHeight: '50px',
        height: '50px',
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
    iconStyle: (data) => {
        let useThumb = false;
        if (data.name in icons) {
            useThumb = true;
        } else {
            const savedIcon = localStorage.getItem(`icon_island_${data.name}`);
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
    rename: (name, newName) => {
        const index = islandsInfo.findIndex(i => i.name === name);
        DebugData.metadata.islands[index] = newName;
        saveMetaData({
            type: 'islands',
            index,
            value: newName
        });
    },
    onClick: (data, setRoot, component) => {
        const {setName} = component.props.rootStateHandler;
        setName(data.name);
    },
    onDoubleClick: (data, component) => {
        saveIcon(data, component);
    },
    selected: (data, component) => {
        if (!component.props.rootState)
            return false;
        const { name } = component.props.rootState;
        return name === data.name;
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
        const { name } = component.props.rootState;
        if (name === data.name
            && DebugData.scope.island
            && DebugData.scope.island.name === name
            && DebugData.scope.island.threeObject) {
            if (!iconRenderer) {
                iconRenderer = createRenderer({webgl2: true}, iconsCanvas, {
                    preserveDrawingBuffer: true
                }, 'thumbnails');
            }
            iconRenderer.applySceneryProps(DebugData.scope.island.props);
            iconRenderer.resize(50, 50);
            iconRenderer.render(DebugData.scope.scene);
            const dataUrl = iconsCanvas.toDataURL();
            if (dataUrl && dataUrl !== 'data:,') {
                icons[data.name] = dataUrl;
            }
            localStorage.setItem(`icon_island_${data.name}`, dataUrl);
        }
    }
}

function getIcon(data, component) {
    if (data.name in icons) {
        return icons[data.name];
    }
    const savedIcon = localStorage.getItem(`icon_island_${data.name}`);
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
        const {name} = component.props.rootState;
        const {setName} = component.props.rootStateHandler;
        const currentIndex = islandsInfo.findIndex(i => i.name === name);
        const index = Math.max(currentIndex - 1, 0);
        const newName = islandsInfo[index].name;
        setName(newName);
        centerView(newName);
    },
    down: (data, collapsed, component) => {
        const {name} = component.props.rootState;
        const {setName} = component.props.rootStateHandler;
        const currentIndex = islandsInfo.findIndex(i => i.name === name);
        const index = Math.min(currentIndex + 1, islandsInfo.length - 1);
        const newName = islandsInfo[index].name;
        setName(newName);
        centerView(newName);
    }
};

function centerView(name) {
    if (name) {
        const elem = document.getElementById(`otl.Islands.${name}`);
        if (elem) {
            elem.scrollIntoView({block: 'center'});
        }
    }
}

export default IslandsNode;
