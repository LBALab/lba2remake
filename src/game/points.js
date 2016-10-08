import async from 'async';
import THREE from 'three';
import _ from 'lodash';

export function createPoint(currentScene, index, pointProps, xOffset, zOffset) {
    let point = pointProps;
    point.index = index;
    point.physics = {
        position: new THREE.Vector3()
    }

    point.currentScene = currentScene;

    point.physics.position.x = point.pos[0] + xOffset * 2;
    point.physics.position.y = point.pos[1];
    point.physics.position.z = point.pos[2] + zOffset * 2;

    const geometry = new THREE.ConeGeometry( 5, 20, 32 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const cone = new THREE.Mesh(geometry, material);

    point.threeObject = cone;
    point.threeObject.position.set(point.physics.position.x, point.physics.position.y, point.physics.position.z);

    point.currentScene.threeScene.add(point.threeObject);
}
