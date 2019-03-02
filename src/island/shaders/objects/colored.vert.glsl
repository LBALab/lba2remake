#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec3 normal;
in float color;

out vec3 vPosition;
out vec3 vNormal;
out float vColor;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vPosition = position;
    vNormal = normal;
    vColor = color;
}
