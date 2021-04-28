precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

in vec3 position;
in vec2 uv;
out vec2 vUv;

#ifdef GRID_EDITOR
    in float flag;
    flat out float vFlag;
#endif

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;

#ifdef GRID_EDITOR
    vFlag = flag;
#endif
}
