precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;

varying vec2 vUv;

#require "./distort.vert"

void main() {
    gl_Position = distort(projectionMatrix * modelViewMatrix * vec4(position, 1.0));
    vUv = position.xz / 32.0;
}
