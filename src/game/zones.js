import async from 'async';
import THREE from 'three';
import _ from 'lodash';

const ZONE_TYPE = {
    CUBE:       0,
    CAMERA:     1,
    SCENERIC:   2,
    FRAGMENT:   3,
    BONUS:      4,
    TEXT:       5,
    LADDER:     6,
    CONVEYOR:   7,
    SPIKE:      8,
    RAIL:       9
}

const ZONE_TYPE_MATERIAL_COLOR = [
    0x84ff84, // 132 255 132 green
    0xff8000, // 255 128 0 orange
    0x6495ed, // 100 149 237 blue/gray
    0x000000, // 
    0xffff6c, // 255 255 108 yeloow 
    0xff0000, // 255 0 0 red 
    0x000000, // 
    0x000000, // 
    0x000000, // 
    0x000000, // 
];

export function createZone(currentScene, index, zoneProps, xOffset, zOffset) {
    let zone = zoneProps;
    zone.index = index;
    zone.physics = {
        position: new THREE.Vector3()
    }
    zone.reloadModel = true;

    zone.currentScene = currentScene;

    zone.physics.position.x = zone.pos[0] + xOffset * 2;
    zone.physics.position.y = zone.pos[1];
    zone.physics.position.z = zone.pos[2] + zOffset * 2;

    const geometry = new THREE.BoxGeometry(zone.box.tX - zone.box.bX, 
                                           zone.box.tY - zone.box.bY, 
                                           zone.box.tZ - zone.box.bZ);
    const material = new THREE.MeshBasicMaterial({
        color: ZONE_TYPE_MATERIAL_COLOR[zone.type], 
        depthTest: true, 
        depthWrite: true,
        wireframe: true 
    });

    // For debug purposes
    const obj = new THREE.Object3D();
    obj.add(new THREE.Mesh(geometry, material));
    obj.position.set(zone.physics.position.x, zone.physics.position.y, zone.physics.position.z);
    zone.currentScene.threeScene.add(obj);

    return zone;
}
