#version 300 es
precision highp float;

uniform sampler2D uTexture;

in vec2 vUv;
in vec4 vUvGroup;
in vec3 vNormal;
in vec3 vMVPos;

out vec4 fragColor;

#require "../../island/shaders/common/fog.frag"
#require "../../island/shaders/common/lut.frag"
#require "../../island/shaders/common/intensity.frag"

void main() {
    vec2 uv = vUv / (vUvGroup.zw + 1.0);
    vec4 texColor = texture(uTexture, uv);
    vec3 palColor = lutLookup(texColor.rgb, intensity());
    fragColor = vec4(fog(palColor), texColor.a);
}
