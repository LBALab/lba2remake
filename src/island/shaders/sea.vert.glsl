precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
    vec3 pos = position;
    float sinv = sin(pos.x * pos.y + time * 2.0) * 0.007;
    pos.z += sinv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vUv = uv + vec2(sinv * 0.01, -sinv * 0.01);
}
