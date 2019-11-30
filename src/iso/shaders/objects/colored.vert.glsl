#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 uNormalMatrix;

in vec3 position;
in vec3 normal;

out vec3 vNormal;

void main() {
    vec4 mPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mPos;
    vNormal = normalize(uNormalMatrix * normal);
}
