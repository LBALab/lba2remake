#include <common>

varying vec3 vPos;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vPos = (modelMatrix * vec4(position, 1.0)).xyz;
}
