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
    0x84ff84, 
    0xff8000, 
    0x6495ed, 
    0xff00ff,  
    0xffff6c, 
    0x00ff00,  
    0x5555ff,  
    0x96c09f,  
    0xffc475,  
    0x008000,  
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
