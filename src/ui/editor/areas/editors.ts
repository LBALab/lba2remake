import GameplayEditor from './gameplay/GameplayEditor';
import ModelEditor from './model/ModelEditor';
import IslandEditor from './island/IslandEditor';
import LayoutsEditor from './layouts/LayoutsEditor';
import IsoGridEditor from './isoGrid/IsoGridEditor';
import { getParams } from '../../../params';
import InventoryEditor from './model/InventoryEditor';

const isLBA1 = getParams().game === 'lba1';

const editors = isLBA1
? [
    GameplayEditor,
    ModelEditor,
    InventoryEditor,
    IsoGridEditor,
    LayoutsEditor
]
: [
    GameplayEditor,
    ModelEditor,
    InventoryEditor,
    IslandEditor,
    IsoGridEditor,
    LayoutsEditor
];

export default editors;
