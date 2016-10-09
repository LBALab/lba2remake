import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {loadModel, updateModel} from '../model';

const geometry = new THREE.CylinderGeometry( 0, 0.01, 0.012, 8, 1, false );
const material = new THREE.MeshBasicMaterial( {color: 0xffffff, depthTest: true, depthWrite: true } );

export function createPoint(currentScene, index, pointProps, xOffset, zOffset) {
    let point = pointProps;
    point.index = index;
    point.physics = {
        position: new THREE.Vector3()
    }
    point.reloadModel = true;

    point.currentScene = currentScene;

    point.physics.position.x = point.pos[0] + xOffset * 2;
    point.physics.position.y = point.pos[1];
    point.physics.position.z = point.pos[2] + zOffset * 2;

    // For debug purposes
    const obj = new THREE.Object3D();
    obj.add(new THREE.Mesh(geometry, material));
    obj.position.set(point.physics.position.x, point.physics.position.y, point.physics.position.z);
    point.currentScene.threeScene.add(obj);

    return point;
}
