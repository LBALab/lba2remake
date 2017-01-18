#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

uniform sampler2D palette;

varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vColorInfo;

#require "./fog.frag"
#require "./dither"

void main() {
    gl_FragColor = vec4(fog(dither(vColorInfo / 16.0).rgb), 1.0);
}
