#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 uNormalMatrix;

in vec3 position;
in float dist;

out float vDist;
out float vY;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vDist = dist;
    vY = position.y;
}
