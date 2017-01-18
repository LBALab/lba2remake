#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

uniform sampler2D palette;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vColor;

#require "../common/fog.frag"
#require "../common/dither"

void main() {
    gl_FragColor = vec4(fog(dither(vColor, 8.0).rgb), 1.0);
}
