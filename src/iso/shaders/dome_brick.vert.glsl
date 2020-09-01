precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;
varying vec3 vPos;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
    vPos = (modelMatrix * vec4(position, 1.0)).xyz;
}
