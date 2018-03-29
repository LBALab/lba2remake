import * as THREE from 'three';

export function createBoundingBox(bb, color) {
    const geometry = new THREE.BoxGeometry(
        bb.max.x - bb.min.x,
        bb.max.y - bb.min.y,
        bb.max.z - bb.min.z
    );

    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const material = new THREE.RawShaderMaterial({
        vertexShader: `
            precision lowp float;
        
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            
            attribute vec3 position;
            
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y + 0.001, position.z, 1.0);
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
    const wireframe = new THREE.LineSegments(edgesGeometry, material);
    wireframe.position.copy(bb.getCenter());
    return wireframe;
}
