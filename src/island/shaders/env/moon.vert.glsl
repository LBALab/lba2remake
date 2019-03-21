#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;

out vec2 vUv;
out vec3 vMVPos;

void main() {
    vec3 pos = position;
    float s = sin(pos.x * pos.z * 0.002);
    pos.y = s * 2.0;
    vec4 mPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mPos;
    vUv = vec2(
        pos.x * 0.001302 + sin(1.9) * 0.0001,
        pos.z * 0.001302 + cos(1.7) * 0.0001
    );
    vMVPos = mPos.xyz;
}
