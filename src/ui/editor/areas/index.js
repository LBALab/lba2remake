import {
    map,
    each,
    find,
    filter,
    concat,
    flatten,
    uniqBy
} from 'lodash';
import editors from './editors';
import NewArea from './utils/NewArea';

const allAreas = concat(findEditorAreas(editors), NewArea);
const allGenerators = findAreaGenerators(allAreas);

export function findAreaContentById(id) {
    return find(allAreas, area => area.id === id || area.replaces === id);
}

export function findMainAreas() {
    return filter(allAreas, area => area.mainArea);
}

export function generateContent(generator) {
    if (generator.func in allGenerators) {
        return allGenerators[generator.func](generator.data);
    }
    return new Promise(resolve => resolve(NewArea));
}

function findEditorAreas(areas) {
    const subAreas = map(areas, area => area.toolAreas || []);
    const flatSubAreas = flatten(subAreas);
    const joinedAreas = concat(areas, flatSubAreas);
    return uniqBy(joinedAreas, area => area.id);
}

function findAreaGenerators(areas) {
    const generators = {};
    each(areas, (area) => {
        Object.assign(generators, area.generators);
    });
    return generators;
}
