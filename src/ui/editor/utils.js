import {find, filter} from 'lodash';
import NewArea from './areas/NewArea';
import GameArea from './areas/GameArea';
import DebugHUDArea from './areas/DebugHUDArea';
import ScriptEditorArea from './areas/ScriptEditorArea';
import {SceneOutliner, Locator, IslandOutliner} from './areas/OutlinerArea';
import IslandArea from './areas/IslandArea';
import ChangeLogArea from './areas/ChangeLogArea';
import {findAllReferences} from './areas/OutlinerArea/nodes/variables';

const AllAreas = [
    NewArea,
    GameArea,
    SceneOutliner,
    Locator,
    DebugHUDArea,
    ScriptEditorArea,
    IslandArea,
    IslandOutliner,
    ChangeLogArea
];

const Generators = {
    findAllReferences
};

export function findAreaContentById(id) {
    return find(AllAreas, area => area.id === id);
}

export function findMainAreas() {
    return filter(AllAreas, area => area.mainArea);
}

export function generateContent(generator) {
    if (generator.func in Generators) {
        return Generators[generator.func](generator.data);
    }
    return new Promise(resolve => resolve(NewArea));
}
