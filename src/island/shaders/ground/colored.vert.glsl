precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute float color;
attribute float intensity;

varying vec3 vPosition;
varying float vColor;
varying float vIntensity;
varying vec2 vGridPos;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vGridPos = position.xz;
    vPosition = position;
    vColor = color;
    vIntensity = intensity;
}
