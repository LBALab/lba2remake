#version 300 es
precision highp float;

in vec3 vPosition;
in vec3 vNormal;
flat in float vPolyType;
flat in float vColor;
flat in float vIntensity;
in vec3 vMVPos;
in float vDistLightning;

out vec4 fragColor;

#require "../../game/scenery/island/shaders/common/fog.frag"
#require "../../game/scenery/island/shaders/common/dither.frag"
#require "../../game/scenery/island/shaders/common/lightning.frag"
#require "../../game/scenery/island/shaders/common/intensity.frag"

void main() {
    vec3 color;
    if (vPolyType < 0.5)
    {
        const vec2 halfPixV = vec2(0.0, 0.03125);
        vec2 uv = vec2(vIntensity, vColor) * 0.0625 + halfPixV;
        color = texture(palette, uv).rgb;
    }
    else
    {
        color = dither(vColor, intensity()).rgb;
    }
    vec3 colWithFog = fog(color);
    vec3 colWithLightning = lightning(colWithFog);
    fragColor = vec4(colWithLightning, 1.0);
}
