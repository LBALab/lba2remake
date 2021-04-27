import GameplayEditor from './gameplay/GameplayEditor';
import ModelEditor from './model/ModelEditor';
import IslandEditor from './island/IslandEditor';
import LayoutsEditor from './layouts/LayoutsEditor';
import IsoGridEditor from './isoGrid/IsoGridEditor';
import { getParams } from '../../../params';

const isLBA1 = getParams().game === 'lba1';

const editors = isLBA1
? [
    GameplayEditor,
    ModelEditor,
    IsoGridEditor,
    LayoutsEditor
]
: [
    GameplayEditor,
    ModelEditor,
    IslandEditor,
    IsoGridEditor,
    LayoutsEditor
];

export default editors;
