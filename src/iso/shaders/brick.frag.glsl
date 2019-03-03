#version 300 es
precision highp float;

uniform sampler2D library;

in vec2 vUv;

out vec4 fragColor;

void main() {
    fragColor = texture(library, vUv);
}
