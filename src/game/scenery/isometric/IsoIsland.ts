import * as THREE from 'three';

import Game from '../../Game';
import IsoScenery from './IsoScenery';
import { getScene } from '../../../resources';
import islandSceneMapping, { LBA1_SECTIONS } from '../island/data/sceneMapping';

export default class IsoIsland {
    static async load(game: Game, sceneData, sceneIndex): Promise<IsoScenery> {
        const sections = await IsoScenery.load(game, sceneData);
        const sceneSection = islandSceneMapping[sceneIndex];

        for (const index of LBA1_SECTIONS) {
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
}
