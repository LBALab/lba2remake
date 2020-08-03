#version 300 es
precision highp float;

in vec4 vColor;
in vec3 vPos;

out vec4 fragColor;

#require "../dome_floor_effect.frag"

void main() {
    fragColor = vColor;
    fragColor.a = fragColor.a * getFloorOpacity(vPos);
    if (fragColor.a < 0.005) {
        discard;
    }
}
