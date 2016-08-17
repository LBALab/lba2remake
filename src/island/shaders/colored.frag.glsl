#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

uniform sampler2D palette;

varying vec2 vColorInfo;
varying vec3 vPos;

#require "./fog.frag"
#require "./dither"

void main() {
    gl_FragColor = vec4(fog(dither(vColorInfo / 16.0).rgb), 1.0);
}
