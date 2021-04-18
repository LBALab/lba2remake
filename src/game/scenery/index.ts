import Game from '../Game';
import Island from './island/Island';
import IsoScenery from './isometric/IsoScenery';
import { getParams } from '../../params';
import IsoIsland from './isometric/IsoIsland';

export type Scenery = Island | IsoScenery;

export async function loadScenery(
    game: Game,
    sceneData: any,
    sceneIndex: number
): Promise<Scenery> {
    const isLBA1 = getParams().game === 'lba1';
    if (sceneData.isIsland && isLBA1) {
        return IsoIsland.load(game, sceneData, sceneIndex);
    }
    if (sceneData.isIsland) {
        return Island.load(game, sceneData);
    }
    return IsoScenery.load(game, sceneData);
}
