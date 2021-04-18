import * as THREE from 'three';

import Game from '../Game';
import Island from './island/Island';
import IsoScenery from './isometric/IsoScenery';
import { getParams } from '../../params';
import { getScene } from '../../resources';
import islandSceneMapping from './island/data/sceneMapping';
// import { WORLD_SIZE } from '../../utils/lba';

export type Scenery = Island | IsoScenery;

export async function loadScenery(
    game: Game,
    sceneData: any,
    sceneIndex: number
): Promise<Scenery> {
    const isLBA1 = getParams().game === 'lba1';
    if (sceneData.isIsland && isLBA1) { // this shouldn't be here
        const sections = await IsoScenery.load(game, sceneData);
        const sceneSection = islandSceneMapping[sceneIndex];

        for (const index of [1, 2, 3, 4, 6]) {
            if (index === sceneIndex) {
                continue;
            }
            const data = await getScene(index);
            const sceneMapping = islandSceneMapping[index];
            const ssection = await IsoScenery.load(game, data);
            const sobj = new THREE.Object3D();
            sobj.add(...ssection.threeObject.children);
            sobj.position.x = (sceneMapping.x - sceneSection.x) * 64;
            sobj.position.y = (sceneMapping.y - sceneSection.y) * 64;
            sobj.position.z = (sceneMapping.z - sceneSection.z) * 64;
            sections.threeObject.add(sobj);
        }
        return sections;
    }
    if (sceneData.isIsland) {
        return Island.load(game, sceneData);
    }
    return IsoScenery.load(game, sceneData);
}
