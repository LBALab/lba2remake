import THREE from 'three';

/*
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
};
*/

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

export function loadZone(props, callback) {
    const pos = props.pos;
    const zone = {
        props: props,
        physics: {
            position: new THREE.Vector3(pos[0], pos[1], pos[2])
        }
    };

    const geometry = new THREE.BoxGeometry(props.box.tX - props.box.bX,
                                            props.box.tY - props.box.bY,
                                            props.box.tZ - props.box.bZ);
    const material = new THREE.MeshBasicMaterial({
        color: ZONE_TYPE_MATERIAL_COLOR[props.type],
        wireframe: true
    });

    const obj = new THREE.Mesh(geometry, material);
    obj.position.set(zone.physics.position.x, zone.physics.position.y, zone.physics.position.z);
    zone.threeObject = obj;

    callback(null, zone);
}
