precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 vps;

attribute vec3 position;
attribute vec3 center;
attribute vec2 uv;
attribute vec2 tile;

varying vec2 vUv;
varying vec2 vCenter;
varying vec2 vTile;

void main() {
    mat4 pmvMatrix = projectionMatrix * modelViewMatrix;
    gl_Position = pmvMatrix * vec4(position, 1.0);
    vUv = uv;
    vCenter = ((pmvMatrix * vec4(center, 1.0)).xy * 0.5 + 0.5) * vps;
    vTile = tile;
}
