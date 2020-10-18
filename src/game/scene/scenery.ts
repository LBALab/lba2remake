import { loadIslandScenery } from '../../island';
import { loadIsometricScenery } from '../../iso';
import { getParams } from '../../params';
import Game from '../Game';
import Renderer from '../../renderer';
import islandSceneMapping from '../../island/data/sceneMapping';

export async function loadScenery(game: Game, renderer: Renderer, sceneData) {
    const params = getParams();
    if (sceneData.isIsland) {
        return loadIslandScenery(params, getIslandName(game, sceneData), sceneData.ambience);
    }
    const useReplacements = renderer.vr || params.iso3d || params.isoCam3d;
    return await loadIsometricScenery(
        sceneData.index,
        sceneData.ambience,
        useReplacements,
        sceneData.actors.length
    );
}

export function getIslandName(game: Game, sceneData) {
    const baseName = islandSceneMapping[sceneData.index].island;
    if (game.getState().flags.quest[152] && baseName === 'CITABAU') {
        return 'CITADEL';
    }
    return baseName;
}
