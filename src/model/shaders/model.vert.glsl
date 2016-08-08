precision lowp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 bones[50];

attribute vec3 position;
attribute vec2 uv;
attribute vec4 color;
attribute float bone;

varying vec4 vColor;
varying vec2 vUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    //vColor = color;
    vUv = uv;
    vColor = vec4(bone/20.0, 0.0, 0.0, 1.0); // testing bone index is provided
}
