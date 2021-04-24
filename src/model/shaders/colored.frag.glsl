#version 300 es
precision highp float;

in vec3 vPosition;
in vec3 vNormal;
in float vColor;
in vec3 vMVPos;
in float vDistLightning;
in float vPolyType;

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
        float colorIndex = floor(vColor / 16.0);
        float intensity = mod(vColor, 16.0);
        vec2 uv = vec2(intensity, colorIndex) * 0.0625 + halfPixV;
        color = texture(palette, uv).rgb;
    }
    else
    {
        color = dither(floor(vColor / 16.0), intensity()).rgb;
    }
    vec3 colWithFog = fog(color);
    vec3 colWithLightning = lightning(colWithFog);
    fragColor = vec4(colWithLightning, 1.0);
}
