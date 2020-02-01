#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform float scale;

in vec2 vUv;
in float shore;
in vec3 vMVPos;
in float vDistLightning;

out vec4 fragColor;

#require "../common/fog.frag"
#require "../common/lightning.frag"

void main() {
    vec4 tex = texture(uTexture, vUv * scale);
    vec3 color = mix(vec3(1.0), tex.rgb, shore);
    vec3 colWithFog = fog(color);
    vec3 colWithLightning = lightning(colWithFog);
    fragColor = vec4(colWithLightning, 1.0);
}
