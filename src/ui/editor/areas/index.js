import {
    map,
    find,
    filter,
    concat,
    flatten,
    uniqBy
} from 'lodash';
import editors from './editors';
import NewArea from './utils/NewArea';

const allAreas = concat(findEditorAreas(editors), NewArea);

export function findAreaContentById(id) {
    return find(allAreas, area => area.id === id || area.replaces === id);
}

export function findMainAreas() {
    return filter(allAreas, area => area.mainArea);
}

function findEditorAreas(areas) {
    const subAreas = map(areas, area => area.toolAreas || []);
    const flatSubAreas = flatten(subAreas);
    const joinedAreas = concat(areas, flatSubAreas);
    return uniqBy(joinedAreas, area => area.id);
}
