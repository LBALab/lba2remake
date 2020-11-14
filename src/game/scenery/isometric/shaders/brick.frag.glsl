#version 300 es
precision highp float;

uniform sampler2D library;

in vec2 vUv;

out vec4 fragColor;

void main() {
    vec4 fColor = texture(library, vUv);
    if (fColor.a < 0.5) {
        discard;
    }
    fragColor = fColor;
}
