#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;

uniform sampler2D palette;
uniform vec4 actorPos[10];

varying vec3 vPosition;
varying float vColor;
varying float vIntensity;
varying vec2 vGridPos;

#require "../common/fog.frag"
#require "../common/dither.frag"
#require "../common/shadow.frag"

void main() {
    gl_FragColor = vec4(fog(dither(vColor, shadow(vIntensity, 0.5)).rgb), 1.0);
}
