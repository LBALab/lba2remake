#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform float worldScale;

in vec3 position;

out vec2 vUv;
out float shore;
out vec3 vMVPos;

void main() {
    vec3 pos = position;
    vec3 wPos = pos * worldScale;
    float s = sin(wPos.x * wPos.z * 0.25 + time * 1.8) + 1.0;
    pos.y = s * 0.144 * pos.y / worldScale;
    vec4 mPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mPos;
    vUv = vec2(
        wPos.x * 0.001302 + sin(time * 1.9) * 0.0001,
        wPos.z * 0.001302 + cos(time * 1.7) * 0.0001
    );
    vMVPos = mPos.xyz;
    shore = position.y;
}
