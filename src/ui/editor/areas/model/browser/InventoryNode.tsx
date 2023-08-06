import * as React from 'react';
import DebugData, { saveMetaData } from '../../../DebugData';
import Renderer from '../../../../../renderer';

import { getParams } from '../../../../../params';
import { GetInventoryItems } from '../../../../../game/data/inventory';

const game = getParams().game;

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

const name = inventory =>
    DebugData.metadata.game.vargames && DebugData.metadata.game.vargames[inventory.index]?.name || `inventory_item_${inventory.index}`;

const inventoryList = [];

const getInventoryItemsList = () => {
    if (inventoryList.length !== 0) {
        return inventoryList;
    }
    const itemsEnum = GetInventoryItems();
    const size = game === 'lba2' ? 54 : 28;
    for (let i = 0; i < size; i += 1) {
        const key = Object.keys(itemsEnum)[i];
        inventoryList.push({
            index: i,
            name: itemsEnum[key]
        });
    }
    return inventoryList;
};

const InvntoryItemNode = {
    dynamic: true,
    name,
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
        if (data.index in icons) {
            useThumb = true;
        } else {
            const savedIcon = localStorage.getItem(`icon_model_entity_${game}_${data.index}`);
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
    rename: (inventory, newName) => {
        DebugData.metadata.game.vargames[inventory.index].name = newName;
        saveMetaData({
            type: 'models',
            subType: 'inventory',
            subIndex: inventory.index,
            value: newName
        });
    },
    onClick: (data, _setRoot, component) => {
        const {setInventory} = component.props.rootStateHandler;
        setInventory(data.index);
    },
    onDoubleClick: (data, component) => {
        saveIcon(data, component);
    },
    selected: (data, _ignored, component) => {
        if (!component.props.rootState)
            return false;
        const { inventory } = component.props.rootState;
        return inventory === data.index;
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
iconsCanvas.width = 50;
iconsCanvas.height = 50;
let iconRenderer = null;

function saveIcon(data, component) {
    if (component && component.props.rootState) {
        const { inventory } = component.props.rootState;
        if (inventory === data.index
            && DebugData.scope.model
            && DebugData.scope.model.inventory === inventory
            && DebugData.scope.model.mesh) {
            DebugData.scope.grid.visible = false;
            if (!iconRenderer) {
                iconRenderer = new Renderer(iconsCanvas, 'thumbnails', {
                    preserveDrawingBuffer: true
                });
                iconRenderer.applySceneryProps({
                    opacity: 0,
                    envInfo: { skyColor: [0, 0, 0] }
                });
            }
            iconRenderer.resize(50, 50);
            iconRenderer.render(DebugData.scope.scene);
            const dataUrl = iconsCanvas.toDataURL();
            if (dataUrl && dataUrl !== 'data:,') {
                icons[data.index] = dataUrl;
            }
            localStorage.setItem(`icon_model_inventory_${game}_${data.index}`, dataUrl);
            DebugData.scope.grid.visible = true;
        }
    }
}

function getIcon(data, component) {
    if (data.index in icons) {
        return icons[data.index];
    }
    const savedIcon = localStorage.getItem(`icon_model_inventory_${game}_${data.index}`);
    if (savedIcon) {
        if (!icons[data.index]) {
            icons[data.index] = savedIcon;
        }
        return savedIcon;
    }
    saveIcon(data, component);
    return 'editor/icons/entity.svg';
}

const InventoryNode = {
    dynamic: true,
    name: () => 'Inventory',
    numChildren: () => getInventoryItemsList().length,
    child: () => InvntoryItemNode,
    childData: (_data, idx) => getInventoryItemsList()[idx],
    up: (_data, _collapsed, component) => {
        const {inventory} = component.props.rootState;
        const {setInventory} = component.props.rootStateHandler;
        const index = Math.max(inventory - 1, 0);
        setInventory(index);
        centerView(index);
    },
    down: (_data, _collapsed, component) => {
        const {inventory} = component.props.rootState;
        const {setInventory} = component.props.rootStateHandler;
        const index = Math.min(inventory + 1, getInventoryItemsList().length - 1);
        setInventory(index);
        centerView(index);
    }
};

function centerView(index) {
    const ent = getInventoryItemsList()[index];
    if (ent) {
        const elem = document.getElementById(`otl.InventoryItems.${name(ent)}`);
        if (elem) {
            elem.scrollIntoView({block: 'center'});
        }
    }
}

export default InventoryNode;
