import Game from '../Game';
import Island from './island/Island';
import IsoScenery from './isometric/IsoScenery';
import { getParams } from '../../params';
import IsoIsland from './isometric/IsoIsland';

// import { WORLD_SIZE } from '../../utils/lba';

export type Scenery = Island | IsoScenery;

export async function loadScenery(
    game: Game,
    sceneData: any,
    sceneIndex: number
): Promise<Scenery> {
    const isLBA1 = getParams().game === 'lba1';
    if (sceneData.isIsland && isLBA1) { // this shouldn't be here
        return IsoIsland.load(game, sceneData, sceneIndex);
    }
    if (sceneData.isIsland) {
        return Island.load(game, sceneData);
    }
    return IsoScenery.load(game, sceneData);
}
