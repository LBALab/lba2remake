#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D palette;
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
    vec2 uv = mod(vUv, vUvGroup.zw) + vUvGroup.xy;
    float colorIndex = mipmapLookup(uv / 255.0);
    vec4 tex = texturePal(colorIndex, intensity());
    fragColor = vec4(fog(tex.rgb), tex.a);
}
