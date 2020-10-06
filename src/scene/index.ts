import * as THREE from 'three';

import { getScene } from '../resources';

export async function loadSceneData(index) {
    return await getScene(index);
}

export function getHtmlColor(palette, index) {
    return `#${new THREE.Color(
        palette[index * 3] / 255,
        palette[(index * 3) + 1] / 255,
        palette[(index * 3) + 2] / 255
    ).getHexString()}`;
}
