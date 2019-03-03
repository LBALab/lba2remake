#version 300 es
precision highp float;

uniform sampler2D palette;
uniform vec4 actorPos[10];

in vec3 vPosition;
in float vColor;
in float vIntensity;
in vec2 vGridPos;

out vec4 fragColor;

#require "../common/fog.frag"
#require "../common/dither.frag"
#require "../common/shadow.frag"

void main() {
    fragColor = vec4(fog(dither(vColor, shadow(vIntensity, 0.5)).rgb), 1.0);
}
