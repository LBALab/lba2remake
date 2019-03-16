import * as THREE from 'three';
import {getObjectName} from '../ui/editor/DebugData';
import { compile } from '../utils/shaders';

export function loadPoint(props) {
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
    const flag = makeFlag();
    flag.name = `point:${getObjectName('point', props.sceneIndex, props.index)}`;
    flag.visible = false;
    flag.position.set(point.physics.position.x, point.physics.position.y, point.physics.position.z);
    flag.matrixAutoUpdate = false;

    point.threeObject = flag;

    return point;
}

function makeFlag() {
    const clothGeom = new THREE.Geometry();
    const v1 = new THREE.Vector3(0, 0.96, 0);
    const v2 = new THREE.Vector3(0, 0.48, 0);
    const v3 = new THREE.Vector3(0, 0.72, 0.48);
    clothGeom.vertices.push(v1);
    clothGeom.vertices.push(v2);
    clothGeom.vertices.push(v3);

    clothGeom.faces.push(new THREE.Face3(0, 1, 2));
    clothGeom.faces.push(new THREE.Face3(0, 2, 1));
    clothGeom.computeFaceNormals();

    const {
        stickMaterial,
        clothMaterial
    } = makeFlagMaterials();

    const stickGeom = new THREE.CylinderGeometry(0.036, 0.036, 0.96, 6, 1, false);
    const stick = new THREE.Mesh(stickGeom, stickMaterial);
    stick.position.set(0, 0.48, 0);
    stick.name = 'stick';

    const cloth = new THREE.Mesh(clothGeom, clothMaterial);
    cloth.name = 'cloth';

    const flag = new THREE.Object3D();
    flag.add(stick);
    flag.add(cloth);

    return flag;
}

let flagMaterials = null;

function makeFlagMaterials() {
    if (!flagMaterials) {
        const stickMaterial = makeMaterial(new THREE.Color('#321d0a'));
        const clothMaterial = makeMaterial(new THREE.Color('#1a78c0'));

        flagMaterials = {
            stickMaterial,
            clothMaterial
        };
    }

    return flagMaterials;
}

function makeMaterial(color) {
    return new THREE.RawShaderMaterial({
        vertexShader: compile('vert', `#version 300 es
            precision highp float;

            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;

            in vec3 position;

            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`),
        fragmentShader: compile('frag', `#version 300 es
            precision highp float;

            uniform vec3 color;

            out vec4 fragColor;

            void main() {
                fragColor = vec4(color, 1.0);
            }`),
        uniforms: {
            color: {value: color}
        }
    });
}
