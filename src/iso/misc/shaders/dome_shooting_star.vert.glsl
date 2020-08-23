uniform vec3 speed;
uniform float uAlpha;

varying vec2 vUv;
varying float vDist;

#include <common>

void main() {
    vec2 uv = position.xy;
    vec3 fwd = inverseTransformDirection(vec3(0, 0, -1), modelViewMatrix);
    vec3 cUp = inverseTransformDirection(vec3(0, 1, 0), modelViewMatrix);
    float distToCamera = length((modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
    float m = clamp(distToCamera * 0.02, 0.0, 1.0);
    vec3 up = mix(vec3(0, 1, 0), cUp, m);
    vec3 right = mix(cross(up, fwd), speed, uAlpha);
    vec2 offset = (uv - 0.5) * 1.3;
    vec3 pos = up * offset.y + right * offset.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vUv = uv;
    vDist = clamp(distToCamera * 0.005, 0.0, 1.0);
}
