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
in float color;
in float boneIndex;

out vec2 vUv;

void main() {
    int idx = int(boneIndex);
    vec3 bPos = bonePos[idx];
    vec4 bRot = boneRot[idx];
    vec3 pos = position + 2.0 * cross(bRot.xyz, cross(bRot.xyz, position) + bRot.w * position) + bPos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    //vPosition = position;
    //vec4 newNormal = rotationMatrix * bones[int(boneIndex)] * vec4(normal, 1.0);
    //vNormal = newNormal.xyz;
    //vColor = color;
    vUv = uv;
}
