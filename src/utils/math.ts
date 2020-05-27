import * as THREE from 'three';
import { each } from 'lodash';

export function getPartialMatrixWorld(node, root) {
    const matrixWorld = new THREE.Matrix4();
    const path = [];
    let next = node;
    while (next && next !== root) {
        path.push(next);
        next = next.parent;
    }
    path.reverse();
    each(path, (obj) => {
        matrixWorld.multiply(obj.matrix);
    });
    return matrixWorld;
}
