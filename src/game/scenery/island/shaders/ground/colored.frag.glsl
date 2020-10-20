#version 300 es
precision highp float;

uniform vec4 actorPos[10];

in vec3 vPosition;
in float vColor;
in float vIntensity;
in vec2 vGridPos;
in vec3 vMVPos;
in float vDistLightning;

out vec4 fragColor;

#require "../common/fog.frag"
#require "../common/dither.frag"
#require "../common/shadow.frag"
#require "../common/lightning.frag"

void main() {
    float intensity = lightningIntensity(vIntensity);
    float intensWithShadow = shadow(intensity, 0.5);
    vec3 colWithDithering = dither(vColor, intensWithShadow).rgb;
    vec3 colWithFog = fog(colWithDithering);
    vec3 colWithLightning = lightning(colWithFog);
    fragColor = vec4(colWithLightning, 1.0);
}
