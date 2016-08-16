#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

uniform sampler2D texture;
uniform sampler2D palette;

varying vec2 vColorInfo;
varying vec2 vUv;
varying vec3 vPos;

#require "./dither"
#require "./texture2DPal"
#require "./fog.frag"

void main() {
    vec4 texInfo = texture2D(texture, vUv);
    vec4 tex = texture2DPal(texInfo, vUv);
    vec4 color = dither(vColorInfo / 16.0);
    vec3 fColor = mix(color.rgb, tex.rgb, tex.a);
    gl_FragColor = vec4(fog(fColor), 1.0);
}
