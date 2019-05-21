#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 cameraPosition;

in vec3 position;
in vec2 uv;

out vec2 vUv;
out vec3 vMVPos;

void main() {
    vec4 mPos = modelViewMatrix * vec4(position, 1.0);
    vec3 pos = vec3(position.x, cameraPosition.y, position.z);
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mPos;
    vUv = uv;
    vMVPos = mvPos.xyz;
}
