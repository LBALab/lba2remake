#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod : enable
#endif
precision highp float;

uniform sampler2D texture;
uniform sampler2D palette;

varying vec2 vColorInfo;
varying vec2 vUv;
varying vec4 vUvGroup;

#require "../common/mipmap"
#require "../common/texture2DPal"
#require "../common/fog.frag"

void main() {
    vec2 uv = mod(vUv, vUvGroup.zw) + vUvGroup.xy;
    vec4 texInfo = mipmapLookup(uv);
    vec4 tex = texture2DPal(texInfo, uv);
    gl_FragColor = vec4(fog(tex.rgb), tex.a);
}
