attribute float size;
attribute float tint;
attribute float intensity;
attribute float sparkle;

varying float vTint;
varying float vIntensity;
varying float vSparkle;
varying vec2 vUv;

#include <common>

void main() {
    vec3 fwd = inverseTransformDirection(vec3(0, 0, -1), modelViewMatrix);
    vec3 cUp = inverseTransformDirection(vec3(0, 1, 0), modelViewMatrix);
    float distToCamera = length((modelViewMatrix * vec4(position, 1.0)).xyz);
    float m = clamp(distToCamera * 0.02, 0.0, 1.0);
    vec3 up = mix(vec3(0, 1, 0), cUp, m);
    vec3 right = cross(up, fwd);
    vec2 offset = (uv - 0.5) * 1.3;
    vec3 pos = position + up * offset.y * size + right * offset.x * size;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vTint = tint;
    vIntensity = intensity;
    vSparkle = sparkle;
    vUv = uv;
}
