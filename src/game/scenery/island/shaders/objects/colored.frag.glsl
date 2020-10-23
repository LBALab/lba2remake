#version 300 es
precision highp float;

in vec3 vPosition;
in vec3 vNormal;
in float vColor;
in vec3 vMVPos;
in float vDistLightning;

out vec4 fragColor;

#require "../common/fog.frag"
#require "../common/dither.frag"
#require "../common/lightning.frag"
#require "../common/intensity.frag"

void main() {
    vec3 colWithDither = dither(vColor, intensity()).rgb;
    vec3 colWithFog = fog(colWithDither);
    vec3 colWithLightning = lightning(colWithFog);
    fragColor = vec4(colWithLightning, 1.0);
}
