#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform float time;

in vec3 position;
in vec2 uv;
in float angle;

out vec2 vUv;
out vec3 vMVPos;
out vec3 vPos;

void main() {
    float size = 600.0;
    float cosT = cos(time + angle);
    float sinT = sin(time + angle);
    vec2 op = uv - 0.5;
    vec2 p = vec2(
        op.x * cosT - op.y * sinT,
        op.y * cosT + op.x * sinT
    ) * size;
    vec3 pos = vec3(
        position.x + p.x,
        position.y,
        position.z + p.y
    );
    vPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    vec4 mPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mPos;
    vMVPos = mPos.xyz;
    vUv = uv;
}
