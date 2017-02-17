precision highp float;

uniform mat4 modelMatrix;
uniform vec2 window;

attribute vec3 position;
attribute vec3 center;
attribute vec2 tile;

varying vec2 vCenter;
varying vec2 vTile;

vec4 isoProjection(vec4 basePosition, vec2 scale) {
    mat4 scaleM = mat4(32.0, 0.0, 0.0, 0.0, 0.0, 32.0, 0.0, 0.0, 0.0, 0.0, 32.0, 0.0, 0.0, 0.0, 0.0, 1.0);
    mat4 rotation = mat4(0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0);
    vec4 pos = scaleM * rotation * modelMatrix  * basePosition;
    return vec4(
        ((pos.x - pos.z) * 48.0 - 3500.0) / scale.x,
        -((pos.x + pos.z) * 24.0 - pos.y * 60.0 + 1000.0) / scale.y,
        1.0,
        1.0
    );
}

void main() {
    gl_Position = isoProjection(vec4(position, 1.0), window);
    vCenter = isoProjection(vec4(center, 1.0), vec2(2.0)).xy + floor(window * 0.5);
    vTile = tile;
}
