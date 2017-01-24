#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod : enable
#endif
precision highp float;

uniform sampler2D texture;
uniform sampler2D palette;
uniform vec3 light;

varying vec3 vNormal;
varying vec2 vUv;
varying vec4 vUvGroup;

#require "../common/mipmap.frag"
#require "../common/texture2DPal.frag"
#require "../common/fog.frag"
#require "../common/intensity.frag"

void main() {
    vec2 uv = mod(vUv, vUvGroup.zw) + vUvGroup.xy;
    vec4 texInfo = mipmapLookup(uv);
    vec4 tex = texture2DPal(texInfo, uv, intensity());
    gl_FragColor = vec4(fog(tex.rgb), tex.a);
}
