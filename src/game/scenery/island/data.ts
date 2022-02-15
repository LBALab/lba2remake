import * as THREE from 'three';

import { loadLUTTexture } from '../../../utils/lut';
import { getCommonResource, getPalette, getIsland, getIslandObjects } from '../../../resources';

export interface IslandData {
    name: string;
    ress: any;
    palette: any;
    ile: any;
    obl: any;
    ambience: any;
    lutTexture: THREE.DataTexture;
    smokeTexture: THREE.Texture;
}

const textureLoader = new THREE.TextureLoader();

export async function loadIslandData(
    name: string,
    ambience: any,
): Promise<IslandData> {
    const [ress, palette, ile, obl, lutTexture, smokeTexture] = await Promise.all([
        getCommonResource(),
        getPalette(),
        getIsland(name),
        getIslandObjects(name),
        loadLUTTexture(),
        textureLoader.loadAsync('images/smoke.png'),
    ]);
    return {
        name,
        ress,
        palette,
        ile,
        obl,
        ambience,
        lutTexture,
        smokeTexture,
    };
}
