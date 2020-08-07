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
    int idx = gl_VertexID % 3;
    vec3 pos = position;
    pos.x += uv.x;
    pos.z += uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vTint = tint;
    vIntensity = intensity;
    vSparkle = sparkle;
    vUv = uv;
}
