import * as React from 'react';
import { map, times } from 'lodash';
import DebugData /*, { saveMetaData }*/ from '../../../DebugData';
import Renderer from '../../../../../renderer';
import { loadHqr } from '../../../../../hqr';

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

const name = (layout) => {
    if (layout.library in DebugData.metadata.libraries
        && layout.index in DebugData.metadata.libraries[layout.library]) {
        return DebugData.metadata.libraries[layout.library][layout.index].name;
    }
    return `layout_${layout.index}`;
};

const key = data => `${data.library}_${data.index}`;

const LayoutNode = {
    dynamic: true,
    name,
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
    iconStyle: (data) => {
        let useThumb = false;
        const k = key(data);
        if (k in icons) {
            useThumb = true;
        } else {
            const savedIcon = localStorage.getItem(`icon_layout_${k}`);
            if (savedIcon) {
                useThumb = true;
            }
        }

        return {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: useThumb ? '60px' : '20px',
            width: useThumb ? '60px' : '20px',
            padding: useThumb ? 0 : 15,
            margin: 0
        };
    },
    rename: (_layout, _newName) => {
        /*
        DebugData.metadata.libraries[layout.library][layout.index] = newName;
        saveMetaData({
            type: 'libraries',
            subType: 'layouts',
            subIndex: layout.index,
            value: newName
        });
        */
    },
    onClick: (data, _setRoot, component) => {
        const {setLayout} = component.props.rootStateHandler;
        setLayout(data.index);
    },
    onDoubleClick: (data, component) => {
        saveIcon(data, component);
    },
    selected: (data, _ignored, component) => {
        if (!component.props.rootState)
            return false;
        const { library, layout } = component.props.rootState;
        return library === data.library && layout === data.index;
    },
    icon: (data, _ignored, component) => getIcon(data, component),
    props: data => [
        {
            id: 'index',
            value: data.index,
            render: value => <div style={indexStyle}>{value}</div>
        }
    ]
};

const icons = {};
const iconsCanvas = document.createElement('canvas');
iconsCanvas.width = 240;
iconsCanvas.height = 240;
let iconRenderer = null;

function saveIcon(data, component) {
    if (component && component.props.rootState) {
        const { library, layout } = component.props.rootState;
        if (library === data.library
            && layout === data.index
            && DebugData.scope.library
            && DebugData.scope.library.index === library
            && DebugData.scope.layout
            && DebugData.scope.layout.index === layout) {
            DebugData.scope.grid.visible = false;
            if (!iconRenderer) {
                iconRenderer = new Renderer({webgl2: true}, iconsCanvas, {
                    preserveDrawingBuffer: true
                }, 'thumbnails');
                iconRenderer.applySceneryProps({
                    opacity: 0,
                    envInfo: { skyColor: [0, 0, 0] }
                });
            }
            iconRenderer.resize(240, 240);
            iconRenderer.render(DebugData.scope.scene);
            const dataUrl = iconsCanvas.toDataURL();
            if (dataUrl && dataUrl !== 'data:,') {
                icons[data.index] = dataUrl;
            }
            const k = key(data);
            localStorage.setItem(`icon_layout_${k}`, dataUrl);
            DebugData.scope.grid.visible = true;
        }
    }
}

function getIcon(data, component) {
    const k = key(data);
    if (k in icons) {
        return icons[k];
    }
    const savedIcon = localStorage.getItem(`icon_layout_${k}`);
    if (savedIcon) {
        if (!icons[k]) {
            icons[k] = savedIcon;
        }
        return savedIcon;
    }
    saveIcon(data, component);
    return 'editor/icons/entity.svg';
}

let bkg = null;
const libraries = {};

loadHqr('LBA_BKG.HQR').then((lBkg) => {
    bkg = lBkg;
});

const getLayouts = () => {
    if (bkg && DebugData.scope.library) {
        const library = DebugData.scope.library.index;
        if (!(library in libraries)) {
            const buffer = bkg.getEntry(179 + library);
            const dataView = new DataView(buffer);
            const numLayouts = dataView.getUint32(0, true) / 4;
            libraries[library] = map(times(numLayouts), index => ({
                library,
                index
            }));
        }
        return libraries[library];
    }
    return [];
};

const LayoutsNode = {
    dynamic: true,
    name: () => 'Layouts',
    numChildren: () => getLayouts().length,
    child: () => LayoutNode,
    childData: (_data, idx) => getLayouts()[idx] || { library: -1, index: idx },
    up: (_data, _collapsed, component) => {
        const {layout} = component.props.rootState;
        const {setLayout} = component.props.rootStateHandler;
        const index = Math.max(layout - 1, 0);
        setLayout(index);
        centerView(index);
    },
    down: (_data, _collapsed, component) => {
        const {layout} = component.props.rootState;
        const {setLayout} = component.props.rootStateHandler;
        const index = Math.min(layout + 1, getLayouts().length - 1);
        setLayout(index);
        centerView(index);
    }
};

function centerView(index) {
    const lt = getLayouts()[index];
    if (lt) {
        const elem = document.getElementById(`otl.Layouts.${name(lt)}`);
        if (elem) {
            elem.scrollIntoView({block: 'center'});
        }
    }
}

export default LayoutsNode;
