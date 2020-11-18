#version 300 es
precision highp float;

uniform sampler2D uTexture;

in vec2 vUV;

out vec4 fragColor;

void main() {
    vec4 fColor = texture(uTexture, vUV);
    if (fColor.a < 0.5) {
        discard;
    }
    fragColor = fColor;
}
