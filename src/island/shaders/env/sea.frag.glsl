#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform float scale;

in vec2 vUv;
in float shore;
in vec3 vMVPos;

out vec4 fragColor;

#require "../common/fog.frag"

void main() {
    vec4 tex = texture(uTexture, vUv * scale);
    vec3 color = mix(vec3(1.0), tex.rgb, shore);
    fragColor = vec4(fog(color), 1.0);
}
