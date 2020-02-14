#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec2 uv;

out vec2 vUv;
out vec3 vMVPos;
out vec3 vPos;

void main() {
    vPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vec4 mPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mPos;
    vMVPos = mPos.xyz;
    vUv = uv;
}
