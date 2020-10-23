#version 300 es
precision highp float;

uniform sampler2D uTexture;

in vec2 vUV;

out vec4 fragColor;

void main() {
    fragColor = texture(uTexture, vUV);
    if (fragColor.a < 0.5) {
        discard;
    }
}
