precision lowp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 bones[50];
uniform vec3 step;

attribute vec3 position;
attribute vec2 uv;
attribute vec4 color;
attribute float boneIndex;

varying vec4 vColor;
varying vec2 vUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * bones[int(boneIndex)] * vec4(position, 1.0);
    vColor = color;
    vUv = uv;
}
