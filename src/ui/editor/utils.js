import {find, filter} from 'lodash';
import NewArea from './areas/NewArea';
import GameArea from './areas/GameArea';
import DebugHUDArea from './areas/DebugHUDArea';
import ScriptEditorArea from './areas/ScriptEditorArea';
import {GameOutliner, IslandOutliner} from './areas/OutlinerArea';
import IslandArea from './areas/IslandArea';

const AllAreas = [
    NewArea,
    GameArea,
    GameOutliner,
    DebugHUDArea,
    ScriptEditorArea,
    IslandArea,
    IslandOutliner
];

export function findAreaContentById(id) {
    return find(AllAreas, area => area.id === id);
}

export function findMainAreas() {
    return filter(AllAreas, area => area.mainArea);
}
