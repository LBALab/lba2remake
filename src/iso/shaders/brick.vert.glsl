precision highp float;

uniform mat4 modelViewMatrix;
uniform vec2 size;
uniform vec2 offset;

attribute vec3 position;
attribute vec3 center;
attribute vec2 tile;

varying vec2 vCenter;
varying vec2 vTile;

mat4 getProjection(vec2 sz) {
    vec2 o = floor(offset * 0.5) * 2.0 + vec2(0.0, 1.0);
    return mat4(
        48.0 / sz.x      , -24.0 / sz.y     , -0.01 , 0.0,
        0.0              , 60.0 / sz.y      , -0.01 , 0.0,
        -48.0 / sz.x     , -24.0 / sz.y     , -0.01 , 0.0,
        -o.x / sz.x , -o.y / sz.y , 0.0   , 1.0
    );
}

void main() {
    gl_Position = getProjection(size) * modelViewMatrix * vec4(position, 1.0);
    vCenter = (getProjection(vec2(2.0)) * modelViewMatrix * vec4(center, 1.0)).xy + floor(size * 0.5);
    vTile = tile;
}
