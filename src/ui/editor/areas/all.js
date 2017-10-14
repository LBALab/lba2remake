import ScriptEditorArea from './ScriptEditorArea';
import GameArea from './GameArea';
import DebugHUDArea from './DebugHUDArea';
import Outliner from './Outliner';
import {find, concat} from 'lodash';
import NewArea from './NewArea';

export const MainAreas = [
    GameArea
];

export const SubAreas = [
    ScriptEditorArea,
    DebugHUDArea,
    Outliner
];

const all = concat(MainAreas, SubAreas, [NewArea]);

export function findAreaContentById(id) {
    return find(all, a => a.id === id);
}
