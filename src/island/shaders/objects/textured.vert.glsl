precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute float color;
attribute vec2 uv;
attribute vec4 uvGroup;

varying float vColor;
varying vec2 vUv;
varying vec4 vUvGroup;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vColor = color;
    vUv = uv;
    vUvGroup = uvGroup;
}
