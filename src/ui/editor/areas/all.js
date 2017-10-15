import ScriptEditorArea from './ScriptEditorArea';
import GameArea from './GameArea';
import DebugHUDArea from './DebugHUDArea';
import OutlinerArea from './OutlinerArea';
import {find, concat} from 'lodash';
import NewArea from './NewArea';

export const MainAreas = [
    GameArea
];

export const SubAreas = [
    ScriptEditorArea,
    DebugHUDArea,
    OutlinerArea
];

const all = concat(MainAreas, SubAreas, [NewArea]);

export function findAreaContentById(id) {
    return find(all, a => a.id === id);
}
