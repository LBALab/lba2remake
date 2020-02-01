#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in float color;
in float intensity;
in vec2 uv;

out vec3 vPosition;
out float vColor;
out float vIntensity;
out vec3 vMVPos;
out vec2 vUv;
out vec2 vGridPos;
out float vDistLightning;

#require "../common/lightning.vert"

void main() {
    vDistLightning = distLightning(position);
    vec4 mPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mPos;
    vGridPos = position.xz;
    vPosition = position;
    vColor = color;
    vIntensity = intensity;
    vUv = uv;
    vMVPos = mPos.xyz;
}
