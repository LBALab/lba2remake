#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod : enable
#endif
precision highp float;

uniform sampler2D texture;
uniform sampler2D palette;

varying float vColor;
varying float vIntensity;
varying vec2 vUv;
varying vec3 vPosition;

#require "../common/mipmap"
#require "../common/dither"
#require "../common/texture2DPal"
#require "../common/fog.frag"

void main() {
    vec4 texInfo = mipmapLookup(vUv);
    vec4 tex = texture2DPal(texInfo, vUv);
    vec4 color = dither(vColor, vIntensity);
    vec3 fColor = mix(color.rgb, tex.rgb, tex.a);
    gl_FragColor = vec4(fog(fColor), 1.0);
}
