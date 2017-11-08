#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
#ifdef GL_EXT_shader_texture_lod
#extension GL_EXT_shader_texture_lod : enable
#endif
precision highp float;

uniform sampler2D texture;
uniform sampler2D palette;
uniform vec2 actorPos;

varying float vColor;
varying float vIntensity;
varying vec2 vUv;
varying vec3 vPosition;
varying vec2 vGridPos;

#require "../common/mipmap.frag"
#require "../common/dither.frag"
#require "../common/texture2DPal.frag"
#require "../common/fog.frag"
#require "../common/shadow.frag"

void main() {
    float colorIndex = mipmapLookup(vUv / 255.0);
    vec4 tex = texture2DPal(colorIndex, shadow(vIntensity, 1.0));
    vec4 color = dither(vColor, shadow(vIntensity, 0.5));
    vec3 fColor = mix(color.rgb, tex.rgb, tex.a);
    gl_FragColor = vec4(fog(fColor), 1.0);
}
