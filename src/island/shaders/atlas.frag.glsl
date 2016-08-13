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
#ifdef GL_EXT_shader_texture_lod
    vec2 dx = dFdx(vUv);
    vec2 dy = dFdy(vUv);
    float d = min(floor(max(length(dx), length(dy))), 4.0);
    vec2 cUv = mod(vUv, vUvGroup.zw + 1.0) + vUvGroup.xy;
    float dim = pow(2.0, 8.0 - d);
    float idim = pow(2.0, d);
    float pix = 1.0 / dim;
    float hpix = pix * 0.5;
    float oneMinusPix = 1.0 - pix;
    vec2 uv = (floor(cUv / idim) / (dim - 1.0)) * oneMinusPix + hpix;
    vec4 tex = texture2DLodEXT(texture, uv, d);
#else
    vec2 uv = mod(vUv, vUvGroup.zw) + vUvGroup.xy;
    vec4 tex = texture2D(texture, uv);
#endif
    vec3 color = mix(vColor.rgb, tex.rgb * vColor.a, tex.a);
    gl_FragColor = vec4(fog(color), tex.a);
}
