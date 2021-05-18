precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec4 color;

varying vec4 vColor;
varying vec3 vPos;

void main() {
    vec4 mPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mPos;
    vColor = color;
    vPos = (modelMatrix * vec4(position, 1.0)).xyz;
}
