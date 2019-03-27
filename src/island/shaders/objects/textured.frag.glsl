#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D palette;
uniform sampler2D lutTexture;
uniform vec3 light;

in vec3 vNormal;
in vec2 vUv;
in vec4 vUvGroup;
in vec3 vMVPos;

out vec4 fragColor;

#require "../common/mipmap.frag"
#require "../common/palette.frag"
#require "../common/fog.frag"
#require "../common/intensity.frag"

void main() {
    vec2 uv = vUv / (vUvGroup.zw + 1.0);
    vec4 texColor = texture(uTexture, uv);
    vec3 palColor = mapToPal(texColor.rgb, intensity());
    fragColor = vec4(fog(palColor), texColor.a);
}
