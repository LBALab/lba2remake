#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform float worldScale;
uniform float scale;
uniform float amplitude;

in vec3 position;

out vec2 vUv;
out vec3 vNormal;
out float shore;
out vec3 vMVPos;
out float vDistLightning;
out vec2 vPos;

#require "../../shaders/common/lightning.vert"

void main() {
    vec3 pos = position;
    vPos = vec2(pos.x, pos.z) * worldScale;
    vec2 i = vPos * 0.5 + time;
    vec2 j = vPos * 0.3 - time;
    vec2 si = sin(i);
    vec2 sj = sin(j);
    float s = (si.x + si.y + sj.x + sj.y) * 0.5;
    pos.y = s * amplitude * pos.y / worldScale;
    vec4 mPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mPos;
    vUv = vPos * 0.001302 * scale;
    vNormal = normalize(
        vec3(
            -(cos(i.x) + cos(j.x)) * amplitude * 2.0,
            1,
            -(cos(i.y) + cos(j.y)) * amplitude * 2.0
        )
    );
    vDistLightning = distLightning(pos);
    vMVPos = mPos.xyz;
    shore = position.y;
}
