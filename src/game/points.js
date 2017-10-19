import THREE from 'three';
import {getObjectName} from '../ui/editor/DebugData';

const geometry = new THREE.CylinderGeometry( 0, 0.008, 0.016, 8, 1, false);
const material = new THREE.MeshBasicMaterial( {color: 0xffffff, depthTest: true, depthWrite: true } );

// TODO: move scetion offset to container THREE.Object3D
export function loadPoint(props, callback) {
    const pos = props.pos;
    const point = {
        index: props.index,
        props: props,
        physics: {
            position: new THREE.Vector3(pos[0], pos[1], pos[2])
        }
    };

    // For debug purposes
    const obj = new THREE.Mesh(geometry, material);
    obj.name = `point:${getObjectName('point', props.sceneIndex, props.index)}`;;
    obj.visible = false;
    obj.position.set(point.physics.position.x, point.physics.position.y, point.physics.position.z);
    obj.matrixAutoUpdate = false;
    point.threeObject = obj;

    callback(null, point);
}
