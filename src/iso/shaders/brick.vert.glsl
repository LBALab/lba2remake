precision highp float;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 window;

attribute vec3 position;
attribute vec3 center;
attribute vec2 tile;

varying vec2 vCenter;
varying vec2 vTile;

vec4 isoProjection(vec4 basePosition, vec2 scale) {
    mat4 scaleM = mat4(32.0, 0.0, 0.0, 0.0, 0.0, 32.0, 0.0, 0.0, 0.0, 0.0, 32.0, 0.0, 0.0, 0.0, 0.0, 1.0);
    mat4 rotation = mat4(0.0, 0.0, -1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0);
    mat4 projection = mat4(
        48.0 / scale.x    , -24.0 / scale.y   , -0.01, 0.0,
        0.0               , 60.0 / scale.y    , -0.01, 0.0,
        -48.0 / scale.x   , -24.0 / scale.y   , -0.01, 0.0,
        -3500.0 / scale.x , -1000.0 / scale.y , 0.0, 1.0
    );
    return projection * scaleM * rotation * modelMatrix * basePosition;
}

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vCenter = isoProjection(vec4(center, 1.0), vec2(2.0)).xy + floor(window * 0.5);
    vTile = tile;
}
