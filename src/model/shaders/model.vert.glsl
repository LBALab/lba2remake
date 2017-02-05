precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 bones[50];

attribute vec3 position;
attribute vec4 normal;
attribute vec2 uv;
attribute float color;
attribute float boneIndex;

varying vec3 vPosition;
varying vec4 vNormal4;
varying vec3 vNormal;
varying float vColor;
varying vec2 vUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * bones[int(boneIndex)] * vec4(position, 1.0);
    vPosition = position;
    vNormal4 = normal;
    vNormal = vec3(normal.xyz);
    vColor = color;
    vUv = uv;
}
