precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 isoProjectionMatrix;
uniform vec2 halfWindow;

attribute vec3 position;
attribute vec3 center;
attribute vec2 tile;

varying vec2 vCenter;
varying vec2 vTile;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vCenter = floor((isoProjectionMatrix * modelViewMatrix * vec4(center, 1.0)).xy) + halfWindow;
    vTile = tile;
}
