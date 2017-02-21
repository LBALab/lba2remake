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
    '#84ff84',
    '#ff8000',
    '#6495ed',
    '#ff00ff',
    '#ffff6c',
    '#00ff00',
    '#5555ff',
    '#96c09f',
    '#ffc475',
    '#008000',
];

export function loadZone(props, callback) {
    const pos = props.pos;
    const zone = {
        index: props.index,
        props: props,
        color: new THREE.Color(ZONE_TYPE_MATERIAL_COLOR[props.type]),
        physics: {
            position: new THREE.Vector3(pos[0], pos[1], pos[2])
        }
    };

    const geometry = new THREE.BoxGeometry(props.box.tX - props.box.bX,
                                            props.box.tY - props.box.bY,
                                            props.box.tZ - props.box.bZ);

    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const material = new THREE.RawShaderMaterial({
        vertexShader: `
            precision highp float;
        
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            
            attribute vec3 position;
            
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                gl_Position.z = 0.0;
            }`,
        fragmentShader: `
            precision highp float;
            
            uniform vec3 color;
            
            void main() {
                gl_FragColor = vec4(color, 1.0);
            }`,
        uniforms: {
            color: {value: zone.color}
        }
    });
    const wireframe = new THREE.LineSegments(edgesGeometry, material);

    wireframe.visible = false;
    wireframe.position.set(zone.physics.position.x, zone.physics.position.y, zone.physics.position.z);
    zone.threeObject = wireframe;

    callback(null, zone);
}
