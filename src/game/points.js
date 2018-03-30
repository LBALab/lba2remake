import * as THREE from 'three';
import {getObjectName} from '../ui/editor/DebugData';

export function loadPoint(props, callback) {
    const pos = props.pos;
    const point = {
        type: 'point',
        index: props.index,
        props,
        physics: {
            position: new THREE.Vector3(pos[0], pos[1], pos[2])
        }
    };

    // For debug purposes
    const obj = makeFlag();
    obj.name = `point:${getObjectName('point', props.sceneIndex, props.index)}`;
    obj.visible = false;
    obj.position.set(point.physics.position.x, point.physics.position.y, point.physics.position.z);
    obj.matrixAutoUpdate = false;
    point.threeObject = obj;

    callback(null, point);
}

const stickMaterial = makeMaterial(new THREE.Color('#321d0a'));
const stickGeom = new THREE.CylinderGeometry(0.0015, 0.0015, 0.04, 6, 1, false);

const clothMaterial = makeMaterial(new THREE.Color('#1a78c0'));
const clothGeom = new THREE.Geometry();
const v1 = new THREE.Vector3(0, 0.04, 0);
const v2 = new THREE.Vector3(0, 0.02, 0);
const v3 = new THREE.Vector3(0, 0.03, 0.02);

clothGeom.vertices.push(v1);
clothGeom.vertices.push(v2);
clothGeom.vertices.push(v3);

clothGeom.faces.push(new THREE.Face3(0, 1, 2));
clothGeom.faces.push(new THREE.Face3(0, 2, 1));
clothGeom.computeFaceNormals();

function makeFlag() {
    const obj = new THREE.Object3D();
    const stick = new THREE.Mesh(stickGeom, stickMaterial);
    stick.position.set(0, 0.02, 0);
    stick.name = 'stick';
    obj.add(stick);
    const cloth = new THREE.Mesh(clothGeom, clothMaterial);
    cloth.name = 'cloth';
    obj.add(cloth);
    return obj;
}

function makeMaterial(color) {
    return new THREE.RawShaderMaterial({
        vertexShader: `
            precision lowp float;
        
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            
            attribute vec3 position;
            
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
        fragmentShader: `
            precision lowp float;
            
            uniform vec3 color;
            
            void main() {
                gl_FragColor = vec4(color, 1.0);
            }`,
        uniforms: {
            color: {value: color}
        }
    });
}
