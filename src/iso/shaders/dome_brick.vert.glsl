#version 300 es
precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;

in vec3 position;
in vec2 uv;

out vec2 vUv;
out vec3 vPos;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
    vPos = (modelMatrix * vec4(position, 1.0)).xyz;
}
