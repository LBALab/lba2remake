precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;

attribute vec3 position;

varying vec2 vUv;
varying float shore;

void main() {
    vec3 pos = position;
    float s = sin(pos.x * pos.z * 0.25 + time * 1.8) + 1.0;
    pos.y = s * 0.144 * pos.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vUv = vec2(
        pos.x * 0.001302 + sin(time * 1.9) * 0.0001,
        pos.z * 0.001302 + cos(time * 1.7) * 0.0001
    );
    shore = position.y;
}
