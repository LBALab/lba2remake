#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec3 normal;
in float color;

out vec3 vPosition;
out vec3 vNormal;
out vec3 vMVPos;
out float vColor;
out float vDistLightning;

#require "../common/lightning.vert"

void main() {
    vDistLightning = distLightning(position);
    vec4 mPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mPos;
    vPosition = position;
    vNormal = normal;
    vColor = color;
    vMVPos = mPos.xyz;
}
