precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;

attribute vec3 position;

varying vec2 vUv;

void main() {
    vec3 pos = position;
    pos.y = (sin(pos.x * pos.z * 6.0 + time * 1.5) + 1.0) * 0.01;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vUv = pos.xz / 64.0;
}
