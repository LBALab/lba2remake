import {map} from 'lodash';
import {loadIsland} from '../island';
import {RequestIslandChange, IslandChanged} from '../game/events';
import islandInfo from '../data/islands';

const islands = map(islandInfo, island => island.name);

export function mainGameLoop(renderer, scene) {
    renderer.stats.begin();

    renderer.render(scene.threeScene);
    renderer.stats.end();
}