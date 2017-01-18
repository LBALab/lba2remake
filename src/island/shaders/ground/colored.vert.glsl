precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute float color;
attribute float intensity;

varying vec3 vPosition;
varying float vColor;
varying float vIntensity;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vPosition = position;
    vColor = color;
    vIntensity = intensity;
}
