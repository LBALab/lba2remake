precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 colorInfo;

varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vColorInfo;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vColorInfo = colorInfo;
    vPos = position;
    vNormal = normal;
}
