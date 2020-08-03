#version 300 es
precision highp float;

uniform vec3 heroPos;

in vec4 vColor;
in vec3 vPos;

out vec4 fragColor;

#require "../dome_floor_effect.frag"

void main() {
    fragColor = vColor;
    fragColor.a = fragColor.a * getFloorOpacity();
    if (fragColor.a < 0.005) {
        discard;
    }
}
