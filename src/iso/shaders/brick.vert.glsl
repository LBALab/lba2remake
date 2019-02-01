precision highp float;

uniform mat4 modelViewMatrix;
uniform vec2 size;
uniform vec2 offset;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

mat4 getProjection() {
    vec2 o = floor(offset * 0.5) * 2.0 + vec2(0.0, 1.0);
    return mat4(
        48.0 / size.x       , -24.0 / size.y    , -0.01     , 0.0,
        0.0                 , 60.0 / size.y     , -0.01     , 0.0,
        -48.0 / size.x      , -24.0 / size.y    , -0.01     , 0.0,
        -o.x / size.x       , -o.y / size.y     , 0.0       , 1.0
    );
}

void main() {
    gl_Position = getProjection() * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
}
