import * as THREE from 'three';

import Game from '../Game';
import Island from './island/Island';
import IsoScenery from './isometric/IsoScenery';
import { getParams } from '../../params';
import { getScene } from '../../resources';
import islandSceneMapping from './island/data/sceneMapping';
// import { WORLD_SIZE } from '../../utils/lba';

export type Scenery = Island | IsoScenery;

export async function loadScenery(game: Game, sceneData: any): Promise<Scenery> {
    const isLBA1 = getParams().game === 'lba1';
    if (sceneData.isIsland && !isLBA1) {
        return Island.load(game, sceneData);
    }
    if (sceneData.isIsland) { // this shouldn't be here
        let sections = null; await IsoScenery.load(game, sceneData);
        for (const index of [1, 2, 3, 4, 6]) {
            const sceneMapping = islandSceneMapping[index];
            const data = await getScene(index);
            const section = await IsoScenery.load(game, data);
            const obj = new THREE.Object3D();
            obj.add(...section.threeObject.children);
            obj.position.x = -sceneMapping.x * 64;
            obj.position.y = sceneMapping.y * 64;
            obj.position.z = sceneMapping.z * 64;
            if (!sections) {
                sections = section;
                sections.threeObject.remove(...section.threeObject.children);
            }
            sections.threeObject.add(obj);
        }
        return sections;
    }
    return IsoScenery.load(game, sceneData);
}
