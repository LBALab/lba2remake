#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform float scale;

in vec2 vUv;
in vec3 vMVPos;

out vec4 fragColor;

#require "../common/fog.frag"

void main() {
    vec4 tex = texture(uTexture, vUv * scale);
    fragColor = vec4(fog(tex.rgb), 1.0);
}
