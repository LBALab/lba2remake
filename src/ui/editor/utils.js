import {find, filter} from 'lodash';
import NewArea from './areas/NewArea';
import GameArea from './areas/GameArea';
import ScriptEditorArea from './areas/ScriptEditorArea';
import {
    SceneOutliner,
    Locator,
    IslandOutliner,
    ModelsOutliner,
    AnimationsOutliner
} from './areas/OutlinerArea';
import IslandArea from './areas/IslandArea';
import InspectorArea from './areas/InspectorArea';
import ModelArea from './areas/ModelArea';
import ChangeLogArea from './areas/ChangeLogArea';
import {findAllReferences} from './areas/OutlinerArea/nodes/variables';

const AllAreas = [
    NewArea,
    GameArea,
    SceneOutliner,
    Locator,
    InspectorArea,
    ScriptEditorArea,
    IslandArea,
    IslandOutliner,
    ModelArea,
    ModelsOutliner,
    AnimationsOutliner,
    ChangeLogArea
];

const Generators = {
    findAllReferences
};

export function findAreaContentById(id) {
    return find(AllAreas, area => area.id === id || area.replaces === id);
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
