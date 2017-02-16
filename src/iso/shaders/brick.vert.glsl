precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 window;

attribute vec3 position;
attribute vec3 center;
attribute vec2 tile;

varying vec2 vCenter;
varying vec2 vTile;

void main() {
    gl_Position = vec4(
        (position.x - position.z) * 48.0 / window.x,
        -((position.x + position.z) * 24.0 - position.y * 60.0) / window.y,
        1.0,
        1.0
    );
    vCenter = vec2(
        ((center.x - center.z) * 48.0) * 0.5 + floor(window.x * 0.5),
        -((center.x + center.z) * 24.0 - center.y * 60.0) * 0.5 + floor(window.y * 0.5)
    );
    vTile = tile;
}
