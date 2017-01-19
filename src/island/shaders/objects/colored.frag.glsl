#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

uniform sampler2D palette;
uniform vec3 light;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vColor;

#require "../common/fog.frag"
#require "../common/dither"

void main() {
    float dp = dot(normalize(vNormal), light);
    float intensity = clamp(dp, 0.0, 1.0) * 16.0;
    gl_FragColor = vec4(fog(dither(vColor, intensity).rgb), 1.0);
}
