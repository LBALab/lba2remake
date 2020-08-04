#version 300 es
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec4 color;

out vec4 vColor;
out vec3 vPos;

void main() {
    vec4 mPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mPos;
    vColor = color;
    vPos = (modelMatrix * vec4(position, 1.0)).xyz;
}
