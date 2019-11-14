// tslint:disable:max-line-length
import * as THREE from 'three';
import {compile} from '../utils/shaders';

export function createBoundingBox(bb, color) {
    const geometry = new THREE.BoxGeometry(
        bb.max.x - bb.min.x,
        bb.max.y - bb.min.y,
        bb.max.z - bb.min.z
    );

    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const material = new THREE.RawShaderMaterial({
        vertexShader: compile('vert', `#version 300 es
            precision highp float;

            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;

            in vec3 position;

            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y + 0.001, position.z, 1.0);
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
    const wireframe = new THREE.LineSegments(edgesGeometry, material);
    const center = new THREE.Vector3();
    bb.getCenter(center);
    wireframe.position.copy(center);
    return wireframe;
}
