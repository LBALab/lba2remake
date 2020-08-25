#include <common>

uniform mat3 uNormalMatrix;

varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vNormal = normalize(uNormalMatrix * normal);
    vUv = uv;
}
