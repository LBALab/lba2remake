#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in float color;
in float intensity;

out vec3 vPosition;
out float vColor;
out float vIntensity;
out vec2 vGridPos;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vGridPos = position.xz;
    vPosition = position;
    vColor = color;
    vIntensity = intensity;
}
