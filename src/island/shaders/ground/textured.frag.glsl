#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform vec4 actorPos[10];

in float vColor;
in float vIntensity;
in vec2 vUv;
in vec3 vPosition;
in vec2 vGridPos;
in vec3 vMVPos;
in float vDistLightning;

out vec4 fragColor;

#require "../common/lut.frag"
#require "../common/fog.frag"
#require "../common/dither.frag"
#require "../common/shadow.frag"
#require "../common/lightning.frag"

void main() {
    float intensity = shadow(lightningIntensity(vIntensity), 0.5);
    vec4 texColor = texture(uTexture, vUv / 255.0);
    vec4 colWithDither = dither(vColor, intensity);
    vec3 texColorLUT = lutLookup(texColor.rgb, intensity);
    vec3 colTexMixed = mix(colWithDither.rgb, texColorLUT.rgb, texColor.a);
    vec3 colWithFog = fog(colTexMixed);
    vec3 colWithLightning = lightning(colWithFog);
    fragColor = vec4(colWithLightning, 1.0);
}
