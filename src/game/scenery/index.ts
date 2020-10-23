import Game from '../Game';
import Island from './island/Island';
import IsoScenery from './isometric/IsoScenery';

export type Scenery = Island | IsoScenery;

export async function loadScenery(game: Game, sceneData: any): Promise<Scenery> {
    return sceneData.isIsland
        ? Island.load(game, sceneData)
        : IsoScenery.load(game, sceneData);
}
