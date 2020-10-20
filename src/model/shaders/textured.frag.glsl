#version 300 es
precision highp float;

uniform sampler2D uTexture;

in vec2 vUv;
in vec4 vUvGroup;
in vec3 vNormal;
in vec3 vMVPos;
in float vDistLightning;

out vec4 fragColor;

#require "../../game/scenery/island/shaders/common/fog.frag"
#require "../../game/scenery/island/shaders/common/lut.frag"
#require "../../game/scenery/island/shaders/common/lightning.frag"
#require "../../game/scenery/island/shaders/common/intensity.frag"

void main() {
    vec2 uv = vUv / (vUvGroup.zw + 1.0);
    vec4 texColor = texture(uTexture, uv);
    vec3 palColor = lutLookup(texColor.rgb, intensity());
    vec3 colWithFog = fog(palColor);
    vec3 colWithLightning = lightning(colWithFog);
    fragColor = vec4(colWithLightning, texColor.a);
}
