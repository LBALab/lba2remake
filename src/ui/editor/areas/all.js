import ScriptEditorArea from './ScriptEditorArea';
import GameArea from './GameArea';
import DebugHUDArea from './DebugHUDArea';
import Outliner from './Outliner';
import {find} from 'lodash';

export const MainAreas = [
    GameArea
];

export const SubAreas = [
    ScriptEditorArea,
    DebugHUDArea,
    Outliner
];

export function findAreaContentByName(name) {
    return find(MainAreas, a => a.name === name)
        || find(SubAreas, a => a.name === name);
}
