#ifdef GL_EXT_shader_texture_lod
#extension GL_OES_standard_derivatives : enable
#extension GL_EXT_shader_texture_lod : enable
#endif
precision highp float;

uniform sampler2D texture;
uniform sampler2D palette;

varying vec2 vColorInfo;
varying vec2 vUv;
varying vec4 vUvGroup;
varying vec3 vPos;

#require "./dither"
#require "./texture2DPal"
#require "./fog.frag"

void main() {
    vec2 uv = mod(vUv, vUvGroup.zw) + vUvGroup.xy;
#ifdef GL_EXT_shader_texture_lod
    vec4 texInfo = texture2DGradEXT(texture, uv, dFdx(vUv), dFdy(vUv));
#else
    vec4 texInfo = texture2D(texture, uv);
#endif
    vec4 tex = texture2DPal(texInfo, uv);
    gl_FragColor = vec4(fog(tex.rgb), tex.a);
}
