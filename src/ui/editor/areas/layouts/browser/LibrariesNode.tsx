import * as React from 'react';
import LibrariesData from '../data/libraries.json';

const indexStyle = {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    color: 'white',
    fontSize: '12px',
    background: 'black',
    opacity: 0.8,
    padding: '0 2px'
};

const LibraryNode = {
    dynamic: true,
    name: library => library.name,
    numChildren: () => 0,
    allowRenaming: () => false,
    style: {
        height: '30px',
        background: '#1F1F1F',
        margin: '4px 0',
        padding: '0'
    },
    nameStyle: {
        lineHeight: '30px',
        height: '30px',
        display: 'block',
        position: 'absolute',
        left: 30,
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
        padding: 5,
        margin: 0
    }),
    onClick: (data, _setRoot, component) => {
        const {setLibrary} = component.props.rootStateHandler;
        setLibrary(data.index);
    },
    selected: (data, _ignored, component) => {
        if (!component.props.rootState)
            return false;
        const { library } = component.props.rootState;
        return library === data.index;
    },
    icon: () => 'editor/icons/areas/layout.png',
    props: data => [
        {
            id: 'index',
            value: data.index,
            render: value => <div style={indexStyle}>{value}</div>
        }
    ]
};

const LibrariesNode = {
    dynamic: true,
    name: () => 'Libraries',
    numChildren: () => LibrariesData.length,
    child: () => LibraryNode,
    childData: (_data, idx) => LibrariesData[idx],
    up: (_data, _collapsed, _component) => {

    },
    down: (_data, _collapsed, _component) => {

    }
};

export default LibrariesNode;
