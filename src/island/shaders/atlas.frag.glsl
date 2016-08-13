#ifdef GL_EXT_shader_texture_lod
#extension GL_OES_standard_derivatives : enable
#extension GL_EXT_shader_texture_lod : enable
#endif
precision highp float;

uniform sampler2D texture;

varying vec4 vColor;
varying vec2 vUv;
varying vec4 vUvGroup;

#require "./fog.frag"

void main() {
    vec2 uv = mod(vUv, vUvGroup.zw) + vUvGroup.xy;
#ifdef GL_EXT_shader_texture_lod
    vec4 tex = texture2DGradEXT(texture, uv, dFdx(vUv), dFdy(vUv));
#else
    vec4 tex = texture2D(texture, uv);
#endif
    vec3 color = mix(vColor.rgb, tex.rgb * vColor.a, tex.a);
    gl_FragColor = vec4(fog(color), tex.a);
}
