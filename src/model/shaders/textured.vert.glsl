#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 bonePos[30];
uniform vec4 boneRot[30];
uniform mat4 rotationMatrix;

in vec3 position;
in vec3 normal;
in vec2 uv;
in vec4 uvGroup;
in float color;
in float boneIndex;

out vec2 vUv;
out vec4 vUvGroup;
out vec3 vNormal;

void main() {
    int idx = int(boneIndex);
    vec3 bPos = bonePos[idx];
    vec4 bRot = boneRot[idx];
    vec3 pos = position + 2.0 * cross(bRot.xyz, cross(bRot.xyz, position) + bRot.w * position) + bPos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vec3 n = normal + 2.0 * cross(bRot.xyz, cross(bRot.xyz, normal) + bRot.w * normal);
    vec4 newNormal = rotationMatrix * vec4(n, 1.0);
    vNormal = newNormal.xyz;
    vUv = uv;
    vUvGroup = uvGroup;
}
