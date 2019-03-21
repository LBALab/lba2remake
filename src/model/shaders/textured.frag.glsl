#version 300 es
precision highp float;
precision highp sampler3D;

uniform sampler2D uTexture;
uniform sampler2D palette;
uniform sampler3D lutTexture;
uniform vec3 light;

in vec2 vUv;
in vec4 vUvGroup;
in vec3 vNormal;
in vec3 vMVPos;

out vec4 fragColor;

#require "../../island/shaders/common/fog.frag"
#require "../../island/shaders/common/palette.frag"
#require "../../island/shaders/common/intensity.frag"

void main() {
    vec2 uv = mod(vUv, vUvGroup.zw + 1.0) + vUvGroup.xy;
    vec4 texColor = texture(uTexture, uv / 256.0);
    vec3 palColor = mapToPal(texColor.rgb, intensity());
    fragColor = vec4(fog(palColor), texColor.a);
}
