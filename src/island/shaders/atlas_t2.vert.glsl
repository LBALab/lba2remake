precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec4 color;
attribute vec2 uv;
attribute vec2 uv2;
attribute vec4 uvGroup;
attribute vec4 uvGroup2;

varying vec4 vColor;
varying vec2 vUv;
varying vec2 vUv2;
varying vec4 vUvGroup;
varying vec4 vUvGroup2;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vColor = color;
    vUv = uv;
    vUv2 = uv2;
    vUvGroup = uvGroup;
    vUvGroup2 = uvGroup2;
}
