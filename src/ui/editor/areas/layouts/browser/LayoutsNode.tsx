import * as React from 'react';
import { map, times, filter } from 'lodash';
import DebugData from '../../../DebugData';
import { map, times } from 'lodash';

import DebugData /*, { saveMetaData }*/ from '../../../DebugData';
import Renderer from '../../../../../renderer';
import { loadHqr } from '../../../../../hqr';
import { Orientation } from '../../../layout';
import { makeOutlinerArea } from '../../utils/outliner';
import { loadSceneMapData } from '../../../../../scene/map';
import { bits } from '../../../../../utils';
import { loadResource, ResourceType } from '../../../../../resources';

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

const mark3DStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    color: 'red',
    fontSize: '12px',
    background: 'black',
    opacity: 0.8,
    padding: '0 2px'
};

const markMirrorStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    color: 'blue',
    fontSize: '12px',
    background: 'black',
    opacity: 0.8,
    padding: '0 2px'
};

const getMetadata = (layout) => {
    if (DebugData.scope.layoutsMetadata
        && layout.library in DebugData.scope.layoutsMetadata
        && layout.index in DebugData.scope.layoutsMetadata[layout.library]) {
        return DebugData.scope.layoutsMetadata[layout.library][layout.index];
    }
    return null;
};

const name = (layout) => {
    const lSettings = getMetadata(layout);
    if (lSettings && lSettings.replace) {
        return lSettings.file;
    }
    return `layout_${layout.index}`;
};

const is3D = (layout) => {
    const lSettings = getMetadata(layout);
    return lSettings && lSettings.replace;
};

const isMirror = (layout) => {
    const lSettings = getMetadata(layout);
    return lSettings && lSettings.mirror;
};

const key = data => `${data.library}_${data.index}`;

const LayoutNode = {
    dynamic: true,
    key,
    name,
    numChildren: () => 0,
    allowRenaming: () => false,
    ctxMenu: [
        {
            name: 'Find variants',
            onClick: (component, data) => {
                findAllVariants(data).then((area) => {
                    component.props.split(Orientation.VERTICAL, area);
                });
            }
        }
    ],
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
        },
        {
            id: 'p3D',
            value: is3D(data) ? '3D' : null,
            render: value => <div style={mark3DStyle}>{value}</div>
        },
        {
            id: 'pMirror',
            value: isMirror(data) ? 'm' : null,
            render: value => <div style={markMirrorStyle}>{value}</div>
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

const getLayouts = () => {
    if (!bkg) {
        loadResource(ResourceType.BRICKS).then((lBkg) => {
            bkg = lBkg;
        });
    }
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

async function findAllVariants(layoutDef) {
    const scenesWithVariants = await findAllVariantsInSceneList(layoutDef);
    return makeOutlinerArea(
        `variants_of_layout${layoutDef.index}`,
        `Variants of layout ${layoutDef.index}`,
        {
            name: `Variants of layout ${layoutDef.index}`,
            children: scenesWithVariants
        },
        {
            icon: 'ref.png'
        }
    );
}

async function findAllVariantsInSceneList(layoutDef) {
    const sceneList = times(222);
    const sceneMap = await loadSceneMapData();
    const layout = loadLayout(layoutDef);
    const scenesWithVariants = await Promise.all(
        map(sceneList, async (scene) => {
            const indexInfo = sceneMap[scene];
            if (indexInfo.isIsland) {
                return null;
            }
            const variants = await findAllVariantsInScene(layoutDef.library, layout, indexInfo);
            if (variants.length > 0) {
                return {
                    name: `Scene ${scene}`,
                    children: variants,
                };
            }
            return null;
        })
    );
    return filter(scenesWithVariants);
}

async function findAllVariantsInScene(libraryIdx, layout, indexInfo) {
    const foundResults = [];
    const isoScenery = await loadIsometricSceneryForSearch(libraryIdx, indexInfo.index, layout);
    if (isoScenery) {
        console.log(isoScenery);
        foundResults.push({
            name: 'Variant 1x2x2',
            children: []
        });
    }
    return foundResults;
}

async function loadIsometricSceneryForSearch(libraryIdx, entry, tgtLayout) {
    const gridData = new DataView(bkg.getEntry(entry + 1));
    const libIndex = gridData.getUint8(0);
    if (libIndex === libraryIdx) {
        const maxOffset = 34 + (4096 * 2);
        const offsets = [];
        for (let i = 34; i < maxOffset; i += 2) {
            offsets.push(gridData.getUint16(i, true) + 34);
        }
        const cells = map(offsets, (offset) => {
            const blocks = [];
            const numColumns = gridData.getUint8(offset);
            offset += 1;
            for (let i = 0; i < numColumns; i += 1) {
                const flags = gridData.getUint8(offset);
                offset += 1;
                const type = bits(flags, 6, 2);
                const height = bits(flags, 0, 5) + 1;

                const block = type === 2 ? {
                    layout: gridData.getUint8(offset) - 1,
                    block: gridData.getUint8(offset + 1)
                } : null;

                if (block)
                    offset += 2;

                for (let j = 0; j < height; j += 1) {
                    switch (type) {
                        case 0:
                            blocks.push(-1);
                            break;
                        case 1: {
                            const layout = gridData.getUint8(offset) - 1;
                            if (layout !== tgtLayout.index) {
                                blocks.push(gridData.getUint8(offset + 1));
                            } else {
                                blocks.push(-1);
                            }

                            offset += 2;
                            break;
                        }
                        case 2:
                            if (block && block.layout !== tgtLayout.index) {
                                blocks.push(block.block);
                            } else {
                                blocks.push(-1);
                            }
                            break;
                        case 3:
                            throw new Error('Unsupported block type');
                    }
                }
            }
            return blocks;
        });
        return cells;
    }
    return null;
}

function loadLayout(layout) {
    const buffer = bkg.getEntry(179 + layout.library);

    const dataView = new DataView(buffer);
    const numLayouts = dataView.getUint32(0, true) / 4;
    const { index } = layout;

    const offset = dataView.getUint32(index * 4, true);
    const nextOffset = index === numLayouts - 1 ?
        dataView.byteLength
        : dataView.getUint32((index + 1) * 4, true);

    const layoutDataView = new DataView(buffer, offset, nextOffset - offset);
    const nX = layoutDataView.getUint8(0);
    const nY = layoutDataView.getUint8(1);
    const nZ = layoutDataView.getUint8(2);
    const numBricks = nX * nY * nZ;
    const bricks = [];
    const lOffset = 3;
    for (let i = 0; i < numBricks; i += 1) {
        bricks.push(layoutDataView.getUint16(lOffset + (i * 4) + 2, true));
    }
    return {
        index,
        nX,
        nY,
        nZ,
        bricks
    };
}

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
        const elem = document.getElementById(`otl.Layouts.${key(lt)}`);
        if (elem) {
            elem.scrollIntoView({block: 'center'});
        }
    }
}

export default LayoutsNode;
