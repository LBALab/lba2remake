#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform float scale;

in vec2 vUv;

out vec4 fragColor;

#require "../common/fog.frag"

void main() {
    vec3 color = texture(uTexture, vUv * scale).rgb;
    fragColor = vec4(fog(color), 1.0);
}
