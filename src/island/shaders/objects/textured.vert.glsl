#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec3 normal;
in float color;
in vec2 uv;
in vec4 uvGroup;

out vec3 vNormal;
out vec2 vUv;
out vec3 vMVPos;
out vec4 vUvGroup;
out float vDistLightning;

#require "../common/lightning.vert"

void main() {
    vDistLightning = distLightning(position);
    vec4 mPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mPos;
    vNormal = normal;
    vUv = uv;
    vUvGroup = uvGroup;
    vMVPos = mPos.xyz;
}
