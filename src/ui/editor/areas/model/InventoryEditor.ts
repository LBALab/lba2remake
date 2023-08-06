import InventoryEditorContent from './InventoryEditorContent';
import InventoryEditorSettings from './InventoryEditorSettings';
import {Orientation, Type} from '../../layout';
import {
    InventoryBrowserArea,
} from './browser/ModelsBrowserArea';

const InventoryEditor = {
    id: 'inventory',
    name: 'Inventory Viewer',
    icon: 'holomap.png',
    content: InventoryEditorContent,
    settings: InventoryEditorSettings,
    mainArea: true,
    getInitialState: () => ({
        inventory: 0,
        rotateView: true,
        wireframe: false,
        grid: true,
    }),
    stateHandler: {
        setRotateView(rotateView) {
            this.setState({ rotateView });
        },
        setWireframe(wireframe) {
            this.setState({ wireframe });
        },
        setGrid(grid) {
            this.setState({ grid });
        },
        setInventory(inventory) {
            this.setState({
                inventory,
            });
        },
    },
    toolAreas: [
        InventoryBrowserArea,
    ],
    defaultLayout: {
        type: Type.LAYOUT,
        orientation: Orientation.HORIZONTAL,
        splitAt: 70,
        children: [
            { type: Type.AREA, content_id: 'inventory', root: true },
            {
                type: Type.LAYOUT,
                orientation: Orientation.VERTICAL,
                splitAt: 50,
                children: [
                    { type: Type.AREA, content_id: 'inventory-items' },
                ]
            }
        ]
    }
};

export default InventoryEditor;
