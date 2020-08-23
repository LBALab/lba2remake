uniform vec3 speed;
uniform float uAlpha;

varying vec2 vUv;
varying float vDist;
varying float vTa;
varying float vSpos;

#include <common>

attribute float tp;
attribute float spos;
attribute vec3 posRnd;

void main() {
    vec2 uv = position.xy;
    vec3 fwd = inverseTransformDirection(vec3(0, 0, -1), modelViewMatrix);
    vec3 cUp = inverseTransformDirection(vec3(0, 1, 0), modelViewMatrix);
    float distToCamera = length((modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
    float m = clamp(distToCamera * 0.02, 0.0, 1.0);
    vec3 up = mix(vec3(0, 1, 0), cUp, m);
    vec3 right = mix(cross(up, fwd), speed, uAlpha * tp);
    vec2 offset = (uv - 0.5) * 1.3;
    float ta = (1.0 - tp);
    vec3 trail = -speed * ta * (spos - 25.0) * 0.01 + posRnd * ta * (50.0 - spos) * 0.02;
    float sz = 0.5 + tp * 0.5;
    vec3 pos = up * offset.y * sz + right * offset.x * sz + trail;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vUv = uv;
    vDist = clamp(distToCamera * 0.005, 0.0, 1.0);
    vTa = ta;
    vSpos = spos;
}
