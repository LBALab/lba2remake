#version 300 es
precision highp float;
precision highp sampler3D;

uniform sampler2D uTexture;
uniform sampler2D palette;
uniform sampler3D lutTexture;
uniform vec3 light;

in vec3 vNormal;
in vec2 vUv;
in vec4 vUvGroup;

out vec4 fragColor;

#require "../common/mipmap.frag"
#require "../common/texturePal.frag"
#require "../common/fog.frag"
#require "../common/intensity.frag"

void main() {
    vec2 uv = vUv / (vUvGroup.zw + 1.0);
    vec4 tex = texture(uTexture, uv);
    float pColor = texture(lutTexture, tex.rgb).a;
    vec4 tColor = texturePal(pColor, intensity());
    fragColor = vec4(fog(tColor.rgb), tex.a);
}
