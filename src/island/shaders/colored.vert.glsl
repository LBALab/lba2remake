precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 colorInfo;

varying vec3 vPos;
varying vec2 vColorInfo;

#require "./distort.vert"

void main() {
    gl_Position = distort(projectionMatrix * modelViewMatrix * vec4(position, 1.0));
    vColorInfo = colorInfo;
    vPos = position;
}
